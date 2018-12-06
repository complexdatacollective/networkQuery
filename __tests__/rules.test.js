/* eslint-env jest */
const getRule = require('../rules').getRule;

const nodes = [
  { type: 'person', attributes: { name: 'William' } },
  { type: 'person', attributes: { name: 'Theodore' } },
];

describe('rules', () => {
  it('getRule() returns a function', () => {

    const ruleConfig = {
      type: 'alter',
      options: {
        "type": "person",
        "attribute": "name",
        "operator": "EXACTLY",
        "value": "William"
      }
    };

    const rule = getRule(ruleConfig);

    expect(typeof rule).toHaveReturned
  });


  it('alter rule', () => {

    const ruleConfig = {
      type: 'alter',
      options: {
        "type": "person",
        "attribute": "name",
        "operator": "EXACTLY",
        "value": "William"
      }
    };

    const rule = getRule(ruleConfig);

    expect(rule(nodes[0])).toEqual(false);
    expect(rule(nodes[1])).toEqual(true);
  });
});
