const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');
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
 *
 * TODO: optimization: when an ego rule is included, we should run that rule first
 */
const fasterFilter = (network, filterLogic) => {
  const result = { nodes: [], edges: [] };
  const edgeMap = buildEdgeLookup(network.edges);

  result.nodes = network.nodes.filter((node) => {
    const ruleRunner = filterLogic.join === 'AND' ? 'every' : 'some';
    return filterLogic.rules[ruleRunner](({ options: rule, type: ruleType }) => {
      if (ruleType === 'alter' || (ruleType === 'ego' && node.id === 1)) {
        // TODO: `id` 1 assumed to be ego for now (matches query.js)
        return predicate(rule.operator)({ value: node[rule.attribute], other: rule.value });
      } else if (ruleType === 'edge') {
        return edgeMap[rule.type] && edgeMap[rule.type].has(node[nodePrimaryKeyProperty]);
      }
      return false;
    });
  });

  const nodeIds = result.nodes.reduce((acc, node) => {
    acc.add(node[nodePrimaryKeyProperty]);
    return acc;
  }, new Set());

  result.edges = network.edges.filter(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to));

  return result;
};

exports.fasterFilter = fasterFilter;
