const nodeAttributesProperty = require('./nodeAttributesProperty');
const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');
const predicate = require('./predicate').default;

const edgeRule = ({ operator, type }) =>
  (node, edgeMap) => {
    switch (operator) {
      case 'EXISTS':
        return edgeMap[type] && edgeMap[type].has(node[nodePrimaryKeyProperty]);
      default:
        return !edgeMap[type] || !edgeMap[type].has(node[nodePrimaryKeyProperty])
    }
  };

const alterRule = ({ attribute, operator, type, value: other }) =>
  (node) => {
    if (!attribute) {
      switch (operator) {
        case 'EXISTS':
          return node.type === type;
        default:
          return node.type != type;
      }
    }

    return node.type === type && predicate(operator)({
      value: node[nodeAttributesProperty][attribute],
      other,
    });
  };

const egoRule = ({ attribute, operator, value: other }) =>
  node =>
    predicate(operator)({
      value: node[nodeAttributesProperty][attribute],
      other,
    });

const getRule = (ruleConfig) => {
  switch(ruleConfig.type) {
    case 'alter':
      return alterRule(ruleConfig.options);
    case 'edge':
      return edgeRule(ruleConfig.options);
    case 'ego':
      return egoRule(ruleConfig.options);
    default:
      return () => false;
  }
}

exports.default = getRule;
