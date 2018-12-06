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
  generateNode({ name: 'William' }),
  generateNode({ name: 'Theodore' }),
  generateNode({ name: 'Rufus' }),
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
      it('EXACTLY', () => {
        const ruleConfig =
        generateRuleConfig(
          'alter',
          {
            type: 'person',
            operator: 'EXACTLY',
            attribute: 'name',
            value: 'William',
          }
        );

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(1);
      });

      it('NOT', () => {
        const ruleConfig =
        generateRuleConfig(
          'alter',
          {
            type: 'person',
            operator: 'NOT',
            attribute: 'name',
            value: 'William',
          }
        );

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(2);
      });
    });
  });
});
