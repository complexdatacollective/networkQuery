const {
  includes,
  map,
} = require('lodash');

const predicate = require('./predicate').default;
const buildEdgeLookup = require('./faster-filter').buildEdgeLookup;
const nodeAttributesProperty = require('./nodeAttributesProperty');
const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');

/*

join([alter('type', 'attribute', 'operator', 'value'), (edges('type')])(network)

or([alter('person', 'age', '>', 29), edges('friends')])(network)

or([
  edges('friends'),
  alter('person', 'age', '>', 29),
])(network);

*/

const emptyNetwork = {
  nodes: [],
  edges: [],
  ego: {},
};

const edgeRule = ({
  type,
  operator,
  value: other,
}) => {
  const rule = (node, edgeMap) => (
    operator === 'EXISTS' ?
      edgeMap[type] && edgeMap[type].has(node[nodePrimaryKeyProperty]) :
      !edgeMap[type] || !edgeMap[type].has(node[nodePrimaryKeyProperty])
  );
  rule.type = 'edge';
  return rule;
}

const alterRule = ({
  type,
  attribute,
  operator,
  value: other,
}) => {
  const rule = node => node.type === type && predicate(operator)({
    value: node[nodeAttributesProperty][attribute],
    other,
  });
  rule.type = 'alter';
  return rule;
}

// remove orphaned edges
const trimEdges = (network) => {
  const uids = map(network.nodes, nodePrimaryKeyProperty);

  const edges = network.edges.filter(
    ({ from, to }) => includes(uids, from) && includes(uids, to),
  );

  return {
    ...network,
    edges,
  };
}

const join = joinType =>
  rules =>
    network => {
      const edgeMap = buildEdgeLookup(network.edges);

      const nodes =  network.nodes.filter(
        node => rules[joinType](rule => rule(node, edgeMap)),
      );

      return trimEdges({
        ...network,
        nodes,
      });
    };

const or = join('some');

const and = join('every');

exports.or = or;
exports.and = and;
exports.alterRule = alterRule;
exports.edgeRule = edgeRule;
