const {
  isEqual,
  isNull,
} = require('lodash');

// operators list
const operators = {
  EXACTLY: 'EXACTLY',
  EXISTS: 'EXISTS',
  NOT_EXISTS: 'NOT_EXISTS',
  NOT: 'NOT',
  GREATER_THAN: 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL',
  LESS_THAN: 'LESS_THAN',
  LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL',
};

/**
 * returns functions that can be used to compare `value` with `other`
 *
 * @param {string} operator One of the operators from the operators list.
 *
 * Usage:
 *
 * ```
 * predicate('GREATER_THAN')({ value: 2, other: 1 }); // returns true
 * ```
 */
const predicate = operator =>
  ({ value, other }) => {
    switch (operator) {
      case operators.GREATER_THAN:
        return value > other;
      case operators.LESS_THAN:
        return value < other;
      case operators.GREATER_THAN_OR_EQUAL:
        return value >= other;
      case operators.LESS_THAN_OR_EQUAL:
        return value <= other;
      case operators.EXACTLY:
        return isEqual(value, other);
      case operators.NOT:
        return !isEqual(value, other);
      case operators.EXISTS:
        return !isNull(value);
      case operators.NOT_EXISTS:
        return isNull(value);
      default:
        return false;
    }
  };

// Provides ES6 named + default imports via babel
Object.defineProperty(exports, '__esModule', {
  value: true,
});

exports.default = predicate;
exports.operators = operators;
