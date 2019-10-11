/* eslint-env jest */
const predicate = require('../predicate').default;
const operators = require('../predicate').operators;
const countOperators = require('../predicate').countOperators;

describe('predicate', () => {
  it('default', () => {
    expect(predicate(null)({ value: null, other: null })).toBe(false);
  });

  describe('operators', () => {
    it('GREATER_THAN', () => {
      expect(
        predicate(operators.GREATER_THAN)({ value: 1.5, other: 1 })
      ).toBe(true);
      expect(
        predicate(operators.GREATER_THAN)({ value: 2, other: 2 })
      ).toBe(false);
    });

    it('LESS_THAN', () => {
      expect(
        predicate(operators.LESS_THAN)({ value: 1, other: 1.5 })
      ).toBe(true);
      expect(
        predicate(operators.LESS_THAN)({ value: 2, other: 2 })
      ).toBe(false);
    });

    it('GREATER_THAN_OR_EQUAL', () => {
      expect(
        predicate(operators.GREATER_THAN_OR_EQUAL)({ value: 1.5, other: 1 })
      ).toBe(true);
      expect(
        predicate(operators.GREATER_THAN_OR_EQUAL)({ value: 2, other: 2 })
      ).toBe(true);
      expect(
        predicate(operators.GREATER_THAN_OR_EQUAL)({ value: 2, other: 3 })
      ).toBe(false);
    });

    it('LESS_THAN_OR_EQUAL', () => {
      expect(
        predicate(operators.LESS_THAN_OR_EQUAL)({ value: 1, other: 1.5 })
      ).toBe(true);
      expect(
        predicate(operators.LESS_THAN_OR_EQUAL)({ value: 2, other: 2 })
      ).toBe(true);
      expect(
        predicate(operators.LESS_THAN_OR_EQUAL)({ value: 3, other: 2 })
      ).toBe(false);
    });

    it('EXACTLY', () => {
      expect(
        predicate(operators.EXACTLY)({ value: 1, other: 1 })
      ).toBe(true);
      expect(
        predicate(operators.EXACTLY)({ value: 2, other: 1 })
      ).toBe(false);
    });

    it('NOT', () => {
      expect(
        predicate(operators.NOT)({ value: 1, other: 1 })
      ).toBe(false);
      expect(
        predicate(operators.NOT)({ value: 2, other: 1 })
      ).toBe(true);
    });

    it('EXISTS', () => {
      expect(
        predicate(operators.EXISTS)({ value: null })
      ).toBe(false);
      expect(
        predicate(operators.EXISTS)({ value: 1 })
      ).toBe(true);
    });

    it('NOT_EXISTS', () => {
      expect(
        predicate(operators.NOT_EXISTS)({ value: 1 })
      ).toBe(false);
      expect(
        predicate(operators.NOT_EXISTS)({ value: null })
      ).toBe(true);
    });

    // True if other is included in value
    it('INCLUDES', () => {
      const other = 'a';
      const value1 = ['a'];
      const value2 = ['a', 'b'];
      const value3 = ['c', 'd'];
      const value4 = ['d'];

      expect(
        predicate(operators.INCLUDES)({ value: value1, other })
      ).toBe(true);
      expect(
        predicate(operators.INCLUDES)({ value: value2, other })
      ).toBe(true);
      expect(
        predicate(operators.INCLUDES)({ value: value3, other })
      ).toBe(false);
      expect(
        predicate(operators.INCLUDES)({ value: value4, other })
      ).toBe(false);
    });

    // True if other is not included in value
    it('EXCLUDES', () => {
      const other = 'a';
      const value1 = ['a'];
      const value2 = ['a', 'b'];
      const value3 = ['a', 'c', 'd'];
      const value4 = ['d'];

      expect(
        predicate(operators.EXCLUDES)({ value: value1, other })
      ).toBe(false);
      expect(
        predicate(operators.EXCLUDES)({ value: value2, other })
      ).toBe(false);
      expect(
        predicate(operators.EXCLUDES)({ value: value3, other })
      ).toBe(false);
      expect(
        predicate(operators.EXCLUDES)({ value: value4, other })
      ).toBe(true);
    });
  });

  describe('Count operators', () => {
    it('COUNT_GREATER_THAN', () => {
      expect(
        predicate(countOperators.COUNT_GREATER_THAN)({ value: 1.5, other: 1 })
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_GREATER_THAN)({ value: 2, other: 2 })
      ).toBe(false);
    });

    it('COUNT_LESS_THAN', () => {
      expect(
        predicate(countOperators.COUNT_LESS_THAN)({ value: 1, other: 1.5 })
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_LESS_THAN)({ value: 2, other: 2 })
      ).toBe(false);
    });

    it('COUNT_GREATER_THAN_OR_EQUAL', () => {
      expect(
        predicate(countOperators.COUNT_GREATER_THAN_OR_EQUAL)({ value: 1.5, other: 1 })
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_GREATER_THAN_OR_EQUAL)({ value: 2, other: 2 })
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_GREATER_THAN_OR_EQUAL)({ value: 2, other: 3 })
      ).toBe(false);
    });

    it('COUNT_LESS_THAN_OR_EQUAL', () => {
      expect(
        predicate(countOperators.COUNT_LESS_THAN_OR_EQUAL)({ value: 1, other: 1.5 })
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_LESS_THAN_OR_EQUAL)({ value: 2, other: 2 })
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_LESS_THAN_OR_EQUAL)({ value: 3, other: 2 })
      ).toBe(false);
    });

    it('COUNT', () => {
      expect(
        predicate(countOperators.COUNT)({ value: 1, other: 1 })
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT)({ value: 2, other: 1 })
      ).toBe(false);
    });

    it('COUNT_NOT', () => {
      expect(
        predicate(countOperators.COUNT_NOT)({ value: 1, other: 1 })
      ).toBe(false);
      expect(
        predicate(countOperators.COUNT_NOT)({ value: 2, other: 1 })
      ).toBe(true);
    });

    it('COUNT_ANY', () => {
      expect(
        predicate(countOperators.COUNT_ANY)({ value: 0 })
      ).toBe(false);
      expect(
        predicate(countOperators.COUNT_ANY)({ value: 100 })
      ).toBe(true);
    });

    it('COUNT_NONE', () => {
      expect(
        predicate(countOperators.COUNT_NONE)({ value: 100 })
      ).toBe(false);
      expect(
        predicate(countOperators.COUNT_NONE)({ value: 0 })
      ).toBe(true);
    });
  });
});
