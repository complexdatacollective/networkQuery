const buildEdgeLookup = require('./buildEdgeLookup');
const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');
const getRule = require('./rules').default;
const predicate = require('./predicate').default;

/**
 * Returns a method which can query the network.
 * The returned method takes a network object as an argument and returns a boolean.
 *
 * @param query
 * @param {Object[]} query.rules An array of rule options
 * @param {('ego'|'alter','edge')} query.rules[].type What the rule will act on
 * @param {Object} query.rules[].options The parameters of the rule
 * @param {Object} query.rules[].count The parameters used to assess the rule outcome (unless type is 'ego')
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
 *       count: { operator: 'GREATER_THAN', value: 0 },
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
  const joinType = join === 'AND' ? 'every' : 'some'; // use the built-in methods

  return (network) => {
    const edgeMap = buildEdgeLookup(network.edges);

    return rules[joinType](({ count, ...ruleConfig }) => {
      const rule = getRule(ruleConfig);

      // we don't perform count on ego rules
      if (ruleConfig.type === 'ego') { return rule(network.ego); }

      const nodes = network.nodes.filter(
        node => rule(node, edgeMap),
      );

      return predicate(count.operator)({ value: nodes.length, other: count.value });
    });
  };
};

exports.default = query;
