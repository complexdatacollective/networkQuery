/* eslint-env jest */
const getFilter = require('../filter').default;
const { entityAttributesProperty } = require('@codaco/shared-consts');
const { getEntityGenerator, generateRuleConfig } = require('./helpers');

const generateEntity = getEntityGenerator();

const network = {
  nodes: [
    generateEntity({ name: 'William', age: 19, favoriteColor: 'green', likesFish: true }),
    generateEntity({ name: 'Theodore', age: 18, favoriteColor: 'red', likesFish: false }),
    generateEntity({ name: 'Rufus', age: 51, favoriteColor: 'red', likesFish: null }),
    generateEntity({ name: 'Phone Box' }, null, 'node', 'publicUtility'),
  ],
  edges: [
    generateEntity({ booleanVariable: true }, { from: 1, to: 2 }, 'edge', 'friend'),
    generateEntity({ booleanVariable: true }, { from: 2, to: 3 }, 'edge', 'friend'),
    generateEntity({ booleanVariable: false }, { from: 1, to: 3 }, 'edge', 'friend'),
    generateEntity({ booleanVariable: false }, { from: 1, to: 2 }, 'edge', 'band'),
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
      };

      const filter = getFilter(filterConfig);
      const result = filter(network);
      expect(result.nodes.length).toEqual(2);
    });
  });

  describe('Boolean edge cases', () => {
    it('"exactly" operator excludes null values', () => {
      const filterConfig = {
        rules: [
          generateRuleConfig('alter', {
            type: 'person',
            operator: 'EXACTLY',
            attribute: 'likesFish',
            value: false,
          }),
        ],
        join: 'OR',
      };

      const filter = getFilter(filterConfig);
      const { nodes, edges } = filter(network);
      const names = nodes.map(node => node[entityAttributesProperty].name);
      expect(names).toEqual(['Theodore']);
      expect(edges.length).toEqual(0);

      const filterConfig2 = {
        rules: [
          generateRuleConfig('alter', {
            type: 'person',
            operator: 'EXACTLY',
            attribute: 'likesFish',
            value: true,
          }),
        ],
        join: 'OR',
      };

      const filter2 = getFilter(filterConfig2);
      const result2 = filter2(network);
      expect(result2.nodes.length).toEqual(1);
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
    };

    const filter = getFilter(filterConfig);

    it('matches are combined', () => {
      const result = filter(network);
      const names = result.nodes.map(node => node[entityAttributesProperty].name);
      expect(names).toEqual(['William', 'Theodore', 'Phone Box']);
      expect(result.edges.length).toEqual(2);
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
          attribute: 'favoriteColor',
          value: 'red',
        }),
      ],
      join: 'AND',
    };

    const filter = getFilter(filterConfig);

    it('matches are refined', () => {
      const result = filter(network);
      const names = result.nodes.map(node => node[entityAttributesProperty].name);
      expect(names).toEqual(['Theodore']);
      expect(result.edges.length).toEqual(0);
    });

    it('orphaned edges are removed', () => {
      const result = filter(network);
      expect(result.edges.length).toEqual(0);
    });
  });

  describe('Edges', () => {
    it('can filter edges by type', () => {
      const filterConfig = {
        rules: [
          generateRuleConfig('edge', {
            type: 'friend',
            operator: 'EXISTS',
          }),
        ],
      };

      const filter = getFilter(filterConfig);

      const result = filter(network);
      const names = result.nodes.map(node => node[entityAttributesProperty].name);
      expect(names).toEqual(['William', 'Theodore', 'Rufus']);
      expect(result.edges.length).toEqual(3);
    });

    // it.todo('can filter edges by type (not)');

    it('can filter edges by attribute', () => {
      const filterConfig = {
        rules: [
          generateRuleConfig('edge', {
            type: 'friend',
            operator: 'EXACTLY',
            attribute: 'booleanVariable',
            value: true,
          }),
        ],
      };

      const filter = getFilter(filterConfig);

      const result = filter(network);
      expect(result.edges.length).toEqual(2);
    });
  });
});
