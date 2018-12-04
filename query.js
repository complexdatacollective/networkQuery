const {
  filter,
  reduce,
  includes,
  map,
  flatMap,
  unionWith,
  isEqual,
  first,
} = require('lodash');

const predicate = require('./predicate').default;
const buildEdgeLookup = require('./faster-filter').buildEdgeLookup;

const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');

/*

AND applies filters sucessively

filterB(filterA(network)) = output;

OR applies them individually and joins

filterA(network) + filterB(network) = output;

// PSEUDOCODE

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
};

const edgeRule = ({
  type,
  attribute, // Unsupported
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

const egoRule = ({
  attribute,
  operator,
  value: other,
}) => {
  const rule = node => node.id === 1 && predicate(operator)({ value: node[attribute], other });
  rule.type = 'ego';
  return rule;
}

const trimEdges = network =>
  repairEdges(network, network);

const repairEdges = (fullNetwork, partialNetwork) => {
  const uids = map(partialNetwork.nodes, nodePrimaryKeyProperty);

  const edges = filter(
    fullNetwork.edges,
    ({ from, to }) => includes(uids, from) && includes(uids, to),
  );

  return {
    nodes: partialNetwork.nodes,
    edges,
  };
}

const or = rules =>
  network => {
    const edgeMap = buildEdgeLookup(network.edges);

    const nodes = network.nodes.filter(
      node =>
        rules.some(rule => (
          rule.type === 'edge' ? rule(edgeMap, node[nodePrimaryKeyProperty]) : rule(node)
        )),
    );

    return trimEdges({
      ...network,
      nodes,
    });
  };

const and = rules =>
  network => {
    const edgeMap = buildEdgeLookup(network.edges);

    const nodes = network.nodes.filter(
      node =>
        rules.every(rule => (
          rule.type === 'edge' ? rule(edgeMap, node[nodePrimaryKeyProperty]) : rule(node)
        )),
    );

    return trimEdges({
      ...network,
      nodes,
    });
  };

// acts like previous 'and' network
const step = rules =>
  network => {
    rules.reduce((memo, rule) => {
      const edgeMap = buildEdgeLookup(memo.edges);

      const nodes = memo.nodes.filter(
        node => rule.type === 'edge' ? rule(edgeMap, node[nodePrimaryKeyProperty]) : rule(node),
      );

      return repairEdges(
        network,
        { nodes }
      );
    },
    { ...network });
  };

exports.or = or;
exports.and = and;
exports.step = step; // previously 'and'
exports.alterRule = alterRule;
exports.egoRule = egoRule;
exports.edgeRule = edgeRule;
