const { entityPrimaryKeyProperty } = require('@codaco/shared-consts');
const getRule = require('./rules').default;

// remove orphaned edges
const trimEdges = (network) => {
  const uids = new Set(network.nodes.map(node => node[entityPrimaryKeyProperty]));

  const edges = network.edges.filter(
    ({ from, to }) => uids.has(from) && uids.has(to),
  );

  return {
    ...network,
    edges,
  };
};

/**
 * Returns a method which can filter the network.
 * The returned method takes a network object and returns a network object
 *
 * @param filter
 * @param {Object[]} filter.rules An array of rule options
 * @param {('alter'|'edge')} filter.rules[].type What the rule will act on
 * @param {Object} filter.rules[].options The parameters of the rule
 * @param {('AND'|'OR')} filter.join The method used to combine rule outcomes
 *
 * Example usage:
 *
 * ```
 * import getFilter from 'networkQuery/filter';
 *
 * const config = {
 *   rules: [
 *     {
 *       type: 'alter',
 *       options: { type: 'person', attribute: 'name', operator: 'EXACTLY', value: 'Bill'},
 *     },
 *     {
 *       type: 'edge',
 *       options: { type: 'friend', operator: 'EXISTS' },
 *     },
 *   ],
 *   join: 'AND',
 * };
 *
 * const filter = getFilter(config);
 * const result = filter(network);
 */

const filter = ({ rules = [], join } = {}) => {
  const ruleRunners = rules.map(getRule);
  return (network) => {
    // AND === feed result of previous rule into next rule
    if (join === 'AND') {
      return ruleRunners.reduce((acc, rule) => rule(acc.nodes, acc.edges), network);
    }

    // OR === each rule runs on fresh network, and networks are merged at the end
    const filteredNetworks = ruleRunners.map(rule => rule(network.nodes, network.edges));

    const resultNodes = filteredNetworks.reduce((acc, { nodes }) => acc.concat(nodes), []);
    const resultEdges = filteredNetworks.reduce((acc, { edges }) => acc.concat(edges), []);

    return trimEdges({ ...network, nodes: resultNodes, edges: resultEdges });
  };
};

// Provides ES6 named + default imports via babel
Object.defineProperty(exports, '__esModule', {
  value: true,
});

exports.default = filter;
