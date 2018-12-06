/* eslint-env jest */
const getFilter = require('../filter').default;
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
      expect(result.nodes.length).toEqual(2);
    });
  });

  describe('OR', () => {
    const filterConfig = {
      rules: [
        generateRuleConfig('alter', {
          type: 'person',
          operator: 'LESS_THAN',
          attribute: 'age',
          value: 20,
        }),
        generateRuleConfig('alter', {
          type: 'publicUtility',
          operator: 'EXISTS',
        }),
      ],
      join: 'OR',
    }

    const filter = getFilter(filterConfig);

    it('matches are combined', () => {
      const result = filter(network);
      expect(result.nodes.length).toEqual(3);
    });

    it('orphaned edges are removed', () => {
      const result = filter(network);
      expect(result.edges.length).toEqual(2);
    });
  });

  describe('AND', () => {
    const filterConfig = {
      rules: [
        generateRuleConfig('alter', {
          type: 'person',
          operator: 'LESS_THAN',
          attribute: 'age',
          value: 20,
        }),
        generateRuleConfig('alter', {
          type: 'person',
          operator: 'EXACTLY',
          attribute: 'favouriteColor',
          value: 'red',
        }),
      ],
      join: 'AND',
    }

    const filter = getFilter(filterConfig);

    it('matches are refined', () => {
      const result = filter(network);
      expect(result.nodes.length).toEqual(1);
    });

    it('orphaned edges are removed', () => {
      const result = filter(network);
      expect(result.edges.length).toEqual(0);
    });
  });
});