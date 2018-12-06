/* eslint-env jest */
const nodeAttributesProperty = require('../nodeAttributesProperty');
const getRule = require('../rules').getRule;

const nodes = [
  { type: 'person', [nodeAttributesProperty]: { name: 'William' } },
  { type: 'person', [nodeAttributesProperty]: { name: 'Theodore' } },
  { type: 'public_utility', [nodeAttributesProperty]: { name: 'Phone Box' } },
];

describe('rules', () => {
  it('getRule() returns a function', () => {
    const rule = getRule({});

    expect(typeof rule).toHaveReturned
  });


  describe('alter rule', () => {
    describe('type rules', () => {
      it('EXISTS', () => {
        const ruleConfig = {
          type: 'alter',
          options: {
            "type": "person",
            "operator": "EXISTS",
          }
        };

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(2);
      });

      it('NOT_EXISTS', () => {
        const ruleConfig = {
          type: 'alter',
          options: {
            "type": "person",
            "operator": "NOT_EXISTS",
          }
        };

        const rule = getRule(ruleConfig);
        const matches = nodes.filter(rule);
        expect(matches.length).toEqual(1);
      });
    });

    // it('correctly matches attribute rules', () => {
    //   const ruleConfig = {
    //     type: 'alter',
    //     options: {
    //       "type": "person",
    //       "attribute": "name",
    //       "operator": "EXACTLY",
    //       "value": "William"
    //     }
    //   };

    //   const rule = getRule(ruleConfig);

    //   expect(rule(nodes[0])).toEqual(false);
    //   expect(rule(nodes[1])).toEqual(true);
    // });
  });
});
