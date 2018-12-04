const {
  includes,
  map,
} = require('lodash');

const predicate = require('./predicate').default;
const buildEdgeLookup = require('./faster-filter').buildEdgeLookup;

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
  const rule = (edgeMap, nodeId) => (
    operator === 'EXISTS' ?
      edgeMap[type] && edgeMap[type].has(nodeId) :
      !edgeMap[type] || !edgeMap[type].has(nodeId)
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
  const rule = node => node.type === type && predicate(operator)({ value: node[attribute], other });
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
        node =>
          rules[joinType](rule => (
            rule.type === 'edge' ? rule(edgeMap, node[nodePrimaryKeyProperty]) : rule(node)
          )),
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
