const {
  isEqual,
  isNull,
} = require('lodash');

const operators = [
  'EXACTLY',
  'EXISTS',
  'NOT_EXISTS',
  'NOT',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
];

const predicate = operator =>
  ({ value, other }) => {
    switch (operator) {
      case 'GREATER_THAN':
        return value > other;
      case 'LESS_THAN':
        return value < other;
      case 'GREATER_THAN_OR_EQUAL':
        return value >= other;
      case 'LESS_THAN_OR_EQUAL':
        return value <= other;
      case 'EXACTLY':
        return isEqual(value, other);
      case 'NOT':
        return !isEqual(value, other);
      case 'EXISTS':
        return !isNull(value);
      case 'NOT_EXISTS':
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
