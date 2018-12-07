/* eslint-env jest */
const predicate = require('../predicate').default;
const operators = require('../predicate').operators;

describe('predicate', () => {
  it('default', () => {
    expect(predicate(null)({ value: null, other: null })).toBe(false);
  });
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
});
