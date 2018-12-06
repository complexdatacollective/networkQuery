const alterRule = (options) =>
  () => {};

const getRule = (ruleConfig) => {
  switch(ruleConfig.type) {
    case 'alter':
      return alterRule(ruleConfig.options);
  }
}

exports.getRule = getRule;
