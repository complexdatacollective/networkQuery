const buildEdgeLookup = require('./buildEdgeLookup');
const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');
const getRule = require('./rules').default;

// remove orphaned edges
const trimEdges = (network) => {
  const uids = new Set(network.nodes.map(node => node[nodePrimaryKeyProperty]));

  const edges = network.edges.filter(
    ({ from, to }) => uids.has(from) && uids.has(to),
  );

  return {
    ...network,
    edges,
  };
}

const filter = ({ rules, join }) => {
  const ruleRunners = rules.map(getRule);

  return (network) => {
    const joinType = join === 'AND' ? 'every' : 'some'; // use the built-in methods

    const edgeMap = buildEdgeLookup(network.edges);

    const nodes =  network.nodes.filter(
      node => ruleRunners[joinType](rule => rule(node, edgeMap)),
    );

    return trimEdges({
      ...network,
      nodes,
    });
  };
}

exports.default = filter;
