const buildEdgeLookup = require('./buildEdgeLookup');
const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');
const getRule = require('./rules').default;

const query = ({ rules, join }) => {
  const ruleRunners = rules.map(getRule);

  return (network) => {
    const joinType = join === 'AND' ? 'every' : 'some'; // use the built-in methods

    const edgeMap = buildEdgeLookup(network.edges);

    ruleRunners.reduce(rule => {

    });

    // const nodes =  network.nodes.filter(
    //   node => [joinType](rule => rule(node, edgeMap)),
    // );

    // return trimEdges({
    //   ...network,
    //   nodes,
    // });

    return false;
  };
};

exports.default = query;
