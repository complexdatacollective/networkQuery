const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');
const nodeAttributesProperty = require('./nodeAttributesProperty');
const predicate = require('./predicate').default;

const buildEdgeLookup = edges =>
  edges.reduce((acc, edge) => {
    // Looks like we only care about type membership right now (not from/to)
    // (this matches the documented filter definitions)
    acc[edge.type] = acc[edge.type] || new Set();
    acc[edge.type].add(edge.from);
    acc[edge.type].add(edge.to);
    return acc;
  }, {});

/**
 * A faster filter function for large networks at the expense of
 * increased memory usage.
 *
 * Unlike the standard/documented approach, this doesn't make direct use of `query`.
 */
const fasterFilter = (network, filterLogic) => {
  const edgeMap = buildEdgeLookup(network.edges);

  const nodes = network.nodes.filter((node) => {
    const ruleRunner = filterLogic.join === 'AND' ? 'every' : 'some';

    return filterLogic.rules[ruleRunner](({ options: rule, type: ruleType }) => {
      switch(ruleType) {
        case 'alter':
          return predicate(rule.operator)({
            value: node[nodeAttributesProperty][rule.attribute],
            other: rule.value
          });
        case 'edge':
          return (
            rule.operator === 'EXISTS' ?
              edgeMap[rule.type] && edgeMap[rule.type].has(node[nodePrimaryKeyProperty]) :
              !edgeMap[rule.type] || !edgeMap[rule.type].has(node[nodePrimaryKeyProperty])
          );
        default:
          return false;
      }
    });
  });

  const nodeIds = nodes.reduce((acc, node) => {
    acc.add(node[nodePrimaryKeyProperty]);
    return acc;
  }, new Set());

  const edges = network.edges.filter(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to));

  return {
    nodes,
    edges,
  };
};

exports.buildEdgeLookup = buildEdgeLookup;
exports.fasterFilter = fasterFilter;
