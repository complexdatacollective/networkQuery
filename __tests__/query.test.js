/* eslint-env jest */
const getQuery = require('../query').default;
const helpers = require('./helpers');
const generateNode = helpers.getNodeGenerator();
const generateRuleConfig = helpers.generateRuleConfig;

const network = {
  nodes: [
    generateNode({ name: 'William', age: 19, favouriteColor: 'green' }),
    generateNode({ name: 'Theodore', age: 18, favouriteColor: 'red' }),
    generateNode({ name: 'Rufus', age: 51, favouriteColor: 'red' }),
    generateNode({ name: 'Phone Box' }, 'publicUtility'),
  ],
  edges: [
    { from: 1, to: 2, type: 'friend' },
    { from: 2, to: 3, type: 'friend' },
    { from: 1, to: 3, type: 'friend' },
    { from: 1, to: 2, type: 'band' },
  ],
};

describe('query', () => {
  describe('single rule', () => {
    it('nodes match the rule', () => {
      const queryConfig = {
        rules: [
          generateRuleConfig('alter', {
            type: 'person',
            operator: 'LESS_THAN',
            attribute: 'age',
            value: 20,
          }, {
            operator: 'GREATER_THAN_OR_EQUAL_TO',
            value: 2,
          }),
        ],
        join: 'OR',
      }

      const query = getQuery(queryConfig);
      const result = query(network);
      expect(result).toEqual(true);
    });
  });
});
