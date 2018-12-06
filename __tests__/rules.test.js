/* eslint-env jest */
const nodeAttributesProperty = require('../nodeAttributesProperty');
const getRule = require('../rules').getRule;

let nodeId = 0;

const generateNode = (attributes, type = 'person') => {
  nodeId += 1;
  return { _uid: nodeId, type, [nodeAttributesProperty]: attributes };
};

const generateRuleConfig = (type, options) => ({
  type,
  options
});

const nodes = [
  generateNode({ name: 'William', age: 19 }),
  generateNode({ name: 'Theodore', age: 18 }),
  generateNode({ name: 'Rufus', age: 51 }),
  generateNode({ name: 'Phone Box' }, 'public_utility'),
];

describe('rules', () => {
  it('getRule() returns a function', () => {
    const rule = getRule({});

    expect(typeof rule).toHaveReturned
  });


  describe('alter rule', () => {
    describe('type rules', () => {
      it('EXISTS', () => {
        const ruleConfig = generateRuleConfig('alter', { type: 'person', operator: 'EXISTS' });

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(3);
      });

      it('NOT_EXISTS', () => {
        const ruleConfig = generateRuleConfig('alter', { type: 'person', operator: 'NOT_EXISTS' })

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(1);
      });
    });

    describe('attribute rules', () => {
      const generateAttributeRuleConfig = config =>
        generateRuleConfig(
          'alter',
          {
            type: 'person',
            operator: 'EXACTLY',
            attribute: 'name',
            value: 'William',
            ...config,
          }
        );

      it('EXACTLY', () => {
        const ruleConfig = generateAttributeRuleConfig({ operator: 'EXACTLY' });

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(1);
      });

      it('NOT', () => {
        const ruleConfig = generateAttributeRuleConfig({ operator: 'NOT' });

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(2);
      });

      it('GREATER_THAN', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'age',
          operator: 'GREATER_THAN',
          value: 19,
        });

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(1);
      });

      it('LESS_THAN', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'age',
          operator: 'LESS_THAN',
          value: 19,
        });

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(1);
      });

    it('GREATER_THAN_OR_EQUAL', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'age',
          operator: 'GREATER_THAN_OR_EQUAL',
          value: 19,
        });

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(2);
      });

      it('LESS_THAN_OR_EQUAL', () => {
        const ruleConfig = generateAttributeRuleConfig({
          attribute: 'age',
          operator: 'LESS_THAN_OR_EQUAL',
          value: 19,
        });

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(2);
      });
    });
  });
});
