/* eslint-env jest */
const getFilter = require('../filter').default;
const helpers = require('./helpers');
const generateNode = helpers.getNodeGenerator();
const generateRuleConfig = helpers.generateRuleConfig;

const network = {
  nodes: [
    generateNode({ name: 'William', age: 19 }),
    generateNode({ name: 'Theodore', age: 18 }),
    generateNode({ name: 'Rufus', age: 51 }),
    generateNode({ name: 'Phone Box' }, 'public_utility'),
  ],
  edges: [
    { from: 1, to: 2, type: 'friend' },
    { from: 2, to: 3, type: 'friend' },
    { from: 1, to: 3, type: 'friend' },
    { from: 1, to: 2, type: 'band' },
  ],
};

describe('filter', () => {
  describe('single rule', () => {
    it('nodes match the rule', () => {
      const filterConfig = {
        rules: [
          generateRuleConfig('alter', {
            type: 'person',
            operator: 'LESS_THAN',
            attribute: 'age',
            value: 20,
          }),
        ],
        join: 'OR',
      }

      const filter = getFilter(filterConfig);
      const result = filter(network);
      expect(result.nodes.length).toEqual(3);
    });
  });
});
