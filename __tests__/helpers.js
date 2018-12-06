const nodeAttributesProperty = require('../nodeAttributesProperty');

const getNodeGenerator = () => {
  let nodeId = 0;

  return (attributes, type = 'person') => {
    nodeId += 1;
    return { _uid: nodeId, type, [nodeAttributesProperty]: attributes };
  };
};

const generateRuleConfig = (type, options, count) => {
  if (count) {
    return {
      type,
      options,
      count,
    };
  }

  return {
    type,
    options,
  };
}

exports.getNodeGenerator = getNodeGenerator;
exports.generateRuleConfig = generateRuleConfig;
