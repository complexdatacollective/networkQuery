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

const groupByType = (acc, rule) => {
  const { type } = rule;
  const typeRules = (acc[type] || []).concat([rule]);

  return {
    ...acc,
    [type]: typeRules,
  };
};

const getQuery = ({ rules, join }) => {
  const ruleRunners = rules
    .map(getRule)
    .reduce(groupByType, {});

  // use the built-in array methods
  const ruleIterator = join === 'AND'
    ? Array.prototype.every
    : Array.prototype.some;

  const query = (network) => {
    const edgeMap = buildEdgeLookup(network.edges);

    return ruleIterator.call(Object.entries(ruleRunners), ([type, typeRules]) => {
      // 'ego' type rules run on a single node
      if (type === 'ego') {
        return ruleIterator.call(typeRules, rule => rule(network.ego));
      }

      /*
       * 'edge' type rules
       * If any of the nodes match, this rule passes.
       * Because this only checks for exists/not-exists, it could
       * be made more efficient with a different map, but prefer
       * parity with the filter function for now.
       * As it stands alter rules and edge rules are considered
       * separately, if groupByType combined them (node rules,
       * can be passed the edgeMap, it will simply ignore it),
       * then nodes would need to contain all properties AND/OR
       * those same node be connected by edges.
       */
      if (type === 'edge') {
        return network.nodes.some(
          node =>
            ruleIterator.call(typeRules, rule => rule(node, edgeMap)),
        );
      }

      /*
       * 'alter' type rule
       * If any of the nodes match, this rule passes.
       */
      return network.nodes.some(
        node =>
          ruleIterator.call(typeRules, rule => rule(node)),
      );
    });
  };

  return query;
};

// Provides ES6 named + default imports via babel
Object.defineProperty(exports, '__esModule', {
  value: true,
});

exports.default = getQuery;
