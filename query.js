const buildEdgeLookup = require('./buildEdgeLookup');
const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');
const getRule = require('./rules').default;
const predicate = require('./predicate').default;

const query = ({ rules, join }) => {
  const joinType = join === 'AND' ? 'every' : 'some'; // use the built-in methods

  return (network) => {
    const edgeMap = buildEdgeLookup(network.edges);

    return rules[joinType](({ count, ...ruleConfig }) => {
      const rule = getRule(ruleConfig);

      // we don't perform count on ego rules
      if (ruleConfig.type === 'ego') { return rule(network.ego); }

      const nodes = network.nodes.filter(
        node => rule(node, edgeMap),
      );

      return predicate(count.operator)({ value: nodes.length, other: count.value });
    });
  };
};

exports.default = query;
