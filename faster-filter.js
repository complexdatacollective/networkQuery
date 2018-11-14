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
 * Optimization: try to reduce the network to an ego node(s), which we can do
 * if there are only ego rule(s), or an ego rule is ANDed with others.
 */
const preFilter = (network, filterLogic) => {
  const egoRules = filterLogic.rules.filter(rule => rule.type === 'ego');
  if (egoRules.length === 0
    || (filterLogic.join === 'OR' && egoRules.length < filterLogic.rules.length)
  ) {
    return { ...network };
  }
  // TODO: See below; id 1 assumed to be ego for now
  const egoNodes = network.nodes.filter(node => node.id === 1);
  if (!egoNodes.length) {
    // TODO: if there's an unmatching ego rule in an AND set,
    // do we allow other rules to run or return the empty network?
    // return { ...network };
  }
  return {
    nodes: egoNodes,
    edges: [], // TODO: Will we need to support loops?
  };
};

/**
 * A faster filter function for large networks at the expense of
 * increased memory usage.
 *
 * Unlike the standard/documented approach, this doesn't make direct use of `query`.
 */
const fasterFilter = (network, filterLogic) => {
  const result = preFilter(network, filterLogic);

  const edgeMap = buildEdgeLookup(result.edges);

  result.nodes = result.nodes.filter((node) => {
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

  result.edges = result.edges.filter(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to));

  return result;
};

exports.fasterFilter = fasterFilter;
