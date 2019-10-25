const buildEdgeLookup = require('./buildEdgeLookup');
const getRule = require('./rules').default;

/**
 * Returns a method which can query the network.
 * The returned method takes a network object as an argument and returns a boolean.
 *
 * @param query
 * @param {Object[]} query.rules An array of rule options
 * @param {('ego'|'alter','edge')} query.rules[].type What the rule will act on
 * @param {Object} query.rules[].options The parameters of the rule
 * @param {Object} query.rules[].count The parameters used to assess the rule outcome
 *                                     (unless type is 'ego')
 * @param {('AND'|'OR')} query.join The method used to combine rule outcomes
 *
 * Example usage:
 *
 * ```
 * import getQuery from 'networkQuery/query';
 *
 * const config = {
 *   rules: [
 *     {
 *       type: 'alter',
 *       options: { type: 'person', attribute: 'name', operator: 'EXACTLY', value: 'Bill'},
 *     },
 *     {
 *       type: 'ego',
 *       options: { attribute: 'name', operator: 'EXACTLY', value: 'Bill'},
 *     },
 *   ],
 *   join: 'AND',
 * };
 *
 * const query = getQuery(config);
 * const result = query(network);
 */

const query = ({ rules, join }) => {
  const ruleRunners = rules.map(getRule);
  // use the built-in array methods
  const ruleIterator = join === 'AND'
    ? Array.prototype.every
    : Array.prototype.some;

  return (network) => {
    const edgeMap = buildEdgeLookup(network.edges);

    return ruleIterator.call(ruleRunners, (rule) => {
      // ego rules run on a single node
      if (rule.type === 'ego') { return rule(network.ego); }

      // edge rules need to check whole network
      if (rule.type === 'edge') {
        const edgeIterator = rule.options.operator === 'EXISTS'
          ? Array.prototype.some
          : Array.prototype.every;

        // this would be more efficient if it
        // simply looked at the edge map for number of edges
        // however that would deviate pretty far from the filter
        // version of the rule, so leave as is for now

        return edgeIterator.call(
          network.nodes,
          node => rule(node, edgeMap),
        );
      }

      // if any of the nodes match, this rule passes
      const result = network.nodes.some(
        node => rule(node, edgeMap),
      );

      return result;
    });
  };
};

// Provides ES6 named + default imports via babel
Object.defineProperty(exports, '__esModule', {
  value: true,
});

exports.default = query;
