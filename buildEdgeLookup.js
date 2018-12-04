const buildEdgeLookup = edges =>
  edges.reduce((acc, edge) => {
    // Looks like we only care about type membership right now (not from/to)
    // (this matches the documented filter definitions)
    acc[edge.type] = acc[edge.type] || new Set();
    acc[edge.type].add(edge.from);
    acc[edge.type].add(edge.to);
    return acc;
  }, {});

module.exports = buildEdgeLookup;
