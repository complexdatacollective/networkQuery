const nodeAttributesProperty = require('./nodeAttributesProperty');
const predicate = require('./predicate').default;

const alterRule = ({ attribute, operator, type, value }) =>
  (node) => {
    if (!attribute) {
      switch (operator) {
        case 'EXISTS':
          return node.type === type;
        default:
          return node.type != type;
      }
    }
  };

const getRule = (ruleConfig) => {
  switch(ruleConfig.type) {
    case 'alter':
      return alterRule(ruleConfig.options);
    default:
      () => true;
  }
}

exports.getRule = getRule;
