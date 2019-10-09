const {
  isEqual,
  isNull,
} = require('lodash');

// operators list
const operators = {
  EXACTLY: 'EXACTLY',
  INCLUDES: 'INCLUDES',
  EXCLUDES: 'EXCLUDES',
  EXISTS: 'EXISTS',
  NOT_EXISTS: 'NOT_EXISTS',
  NOT: 'NOT',
  GREATER_THAN: 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL: 'GREATER_THAN_OR_EQUAL',
  LESS_THAN: 'LESS_THAN',
  LESS_THAN_OR_EQUAL: 'LESS_THAN_OR_EQUAL',
};

// count operators list
const countOperators = {
  COUNT: 'COUNT',
  COUNT_NOT: 'COUNT_NOT',
  COUNT_ANY: 'COUNT_ANY',
  COUNT_NONE: 'COUNT_NONE',
  COUNT_GREATER_THAN: 'COUNT_GREATER_THAN',
  COUNT_GREATER_THAN_OR_EQUAL: 'COUNT_GREATER_THAN_OR_EQUAL',
  COUNT_LESS_THAN: 'COUNT_LESS_THAN',
  COUNT_LESS_THAN_OR_EQUAL: 'COUNT_LESS_THAN_OR_EQUAL',
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
      case countOperators.COUNT_GREATER_THAN:
        return value > other;
      case operators.LESS_THAN:
      case countOperators.COUNT_LESS_THAN:
        return value < other;
      case operators.GREATER_THAN_OR_EQUAL:
      case countOperators.COUNT_GREATER_THAN_OR_EQUAL:
        return value >= other;
      case operators.LESS_THAN_OR_EQUAL:
      case countOperators.COUNT_LESS_THAN_OR_EQUAL:
        return value <= other;
      case operators.EXACTLY:
      case countOperators.COUNT:
        return isEqual(value, other);
      case operators.NOT:
      case countOperators.COUNT_NOT:
        return !isEqual(value, other);
      case operators.INCLUDES: {
        const difference = value.filter(x => !other.includes(x));
        return difference.length === 0;
      }
      case operators.EXCLUDES: {
        const difference = value.filter(x => other.includes(x));
        return difference.length === 0;
      }
      case operators.EXISTS:
        return !isNull(value);
      case operators.NOT_EXISTS:
        return isNull(value);
      case countOperators.COUNT_ANY:
        return value > 0;
      case countOperators.COUNT_NONE:
        return value === 0;
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
exports.countOperators = countOperators;
