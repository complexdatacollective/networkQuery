/* eslint-env jest */
const getQuery = require('../query').default;
const nodeAttributesProperty = require('../nodeAttributesProperty');
const helpers = require('./helpers');
const generateNode = helpers.getNodeGenerator();
const generateRuleConfig = helpers.generateRuleConfig;

const network = {
  ego: {
    [nodeAttributesProperty]: {
      age: 20,
    },
  },
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
    it('returns a boolean', () => {
      const queryConfig = {
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

      const query = getQuery(queryConfig);
      const result = query(network);
      expect(result).toEqual(true);
    });
  });

  describe('OR', () => {
    const queryConfig = {
      rules: [
        generateRuleConfig('alter', {
          type: 'person',
          operator: 'LESS_THAN',
          attribute: 'age',
          value: 20,
        }),
        generateRuleConfig('ego', {
          operator: 'EXACTLY',
          attribute: 'age',
          value: 20,
        }),
      ],
      join: 'OR',
    }

    const query = getQuery(queryConfig);

    it('results are summed with OR', () => {
      const result = query(network);
      expect(result).toEqual(true);
    });
  });

  describe('AND', () => {
    const queryConfig = {
      rules: [
        generateRuleConfig('alter', {
          type: 'person',
          operator: 'LESS_THAN',
          attribute: 'age',
          value: 20,
        }),
        generateRuleConfig('ego', {
          operator: 'EXACTLY',
          attribute: 'age',
          value: 20,
        }),
      ],
      join: 'AND',
    }

    const query = getQuery(queryConfig);

    it('results are summed with AND', () => {
      const result = query(network);
      expect(result).toEqual(false);
    });
  });
});
