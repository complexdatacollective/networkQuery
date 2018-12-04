const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');
const nodeAttributesProperty = require('./nodeAttributesProperty');
const buildEdgeLookup = require('./buildEdgeLookup');
const predicate = require('./predicate').default;

const alterRule = (rule, node) => {
  if (!rule.attribute) {
    switch (rule. operator) {
      case 'EXISTS':
        return node.type === rule.type;
      default:
        return node.type != rule.type;
    }
  }

  return predicate(rule.operator)({
    value: node[nodeAttributesProperty][rule.attribute],
    other: rule.value
  });
}

const edgeRule = (rule, node, edgeMap) => (
  rule.operator === 'EXISTS' ?
    edgeMap[rule.type] && edgeMap[rule.type].has(node[nodePrimaryKeyProperty]) :
    !edgeMap[rule.type] || !edgeMap[rule.type].has(node[nodePrimaryKeyProperty])
);

const getRuleForType = (type) => {
  switch(type) {
    case 'alter':
      return alterRule;
    case 'edge':
      return edgeRule;
    default:
      return () => false;
  }
}

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

    return filterLogic.rules[ruleRunner](
      ({ options, type: ruleType }) => getRuleForType(ruleType)(options, node, edgeMap),
    );
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

exports.fasterFilter = fasterFilter;
