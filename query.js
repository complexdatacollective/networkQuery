const {
  filter,
  reduce,
  includes,
  map,
  flatMap,
  unionWith,
  isEqual,
  first,
  flow: and,
} = require('lodash');

const predicate = require('./predicate').default;

const nodePrimaryKeyProperty = require('./nodePrimaryKeyProperty');

/*

AND applies filters sucessively

filterB(filterA(network)) = output;

OR applies them individually and joins

filterA(network) + filterB(network) = output;

// PSEUDOCODE

alter('type', 'attribute', 'operator', 'value')(edges('type')(network))

alter('person', 'age', '>', 29)(edges('friends')(network))

compose(
  edges('friends'),
  alter('person', 'age', '>', 29),
)(network);

*/

const emptyNetwork = {
  nodes: [],
  edges: [],
};

const edgeRule = ({
  type,
  attribute,
  operator,
  value: other,
}) =>
  (network) => {
    const sourceEdges = filter(network.edges, ['type', type]);
    const edges = filter(
      sourceEdges,
      edge => predicate(operator)({ value: edge[attribute], other }),
    );
    // TODO: extract next two lines into reusable method, and do one for node -> edge
    const uids = flatMap(edges, ({ from, to }) => [from, to]);
    const nodes = filter(network.nodes, ({ [nodePrimaryKeyProperty]: uid }) => includes(uids, uid));

    return {
      edges,
      nodes,
    };
  };

const alterRule = ({
  type,
  attribute,
  operator,
  value: other,
}) =>
  (network) => {
    const sourceNodes = attribute ? filter(network.nodes, ['type', type]) : network.nodes;
    const nodes = filter(
      sourceNodes,
      node => predicate(operator)({ value: node[attribute], other }),
    );
    const uids = map(nodes, nodePrimaryKeyProperty);
    const edges = filter(
      network.edges,
      ({ from, to }) => includes(uids, from) || includes(uids, to),
    );

    return {
      nodes,
      edges,
    };
  };

const egoRule = ({
  attribute,
  operator,
  value: other,
}) =>
  (network) => {
    const egoNode = first(filter(network.nodes, ['id', 1])); // `id` 1 assumed to be ego
    if (predicate(operator)({ value: egoNode[attribute], other })) {
      const edges = filter(network.edges, ({ from, to }) => includes([from, to], 1));
      return {
        nodes: [egoNode],
        edges,
      };
    }
    return { ...emptyNetwork };
  };

const or = steps =>
  network => reduce(
    steps,
    (memo, step) => {
      const result = step(network);
      return ({
        nodes: unionWith(memo.nodes, result.nodes, isEqual),
        edges: unionWith(memo.edges, result.edges, isEqual),
      });
    },
    { ...emptyNetwork },
  );

/**
 * Performing a query may result in orphan nodes/edges.
 *
 * It is assumed that the querent will want the complete
 * network for the remaining nodes. This reinstates *all*
 * edges associated with those nodes, including those
 * which may have previously been removed.
 */
const repair = (query) =>
  (network) => {
    const result = query(network);
    const uids = map(result.nodes, nodePrimaryKeyProperty);
    const edges = filter(
      network.edges,
      ({ from, to }) => includes(uids, from) && includes(uids, to),
    );
    return {
      nodes: result.nodes,
      edges,
    };
  }


exports.repair = repair;
exports.or = or;
exports.and = and;
exports.alterRule = alterRule;
exports.egoRule = egoRule;
exports.edgeRule = edgeRule;
