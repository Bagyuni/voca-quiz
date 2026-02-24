import { describe, expect, test } from 'bun:test';
import { cn, shuffle } from './utils';

describe('cn', () => {
  test('joins multiple strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  test('filters out false', () => {
    expect(cn('btn', false && 'active')).toBe('btn');
  });

  test('filters out null and undefined', () => {
    expect(cn('btn', null, undefined, 'big')).toBe('btn big');
  });

  test('keeps conditional truthy values', () => {
    expect(cn('btn', true && 'active', 'large')).toBe('btn active large');
  });

  test('returns empty string when all falsy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  test('single argument', () => {
    expect(cn('solo')).toBe('solo');
  });
});

describe('shuffle', () => {
  test('returns a new array', () => {
    const original = [1, 2, 3];
    const result = shuffle(original);
    expect(result).not.toBe(original);
  });

  test('does not mutate the original', () => {
    const original = [1, 2, 3];
    shuffle(original);
    expect(original).toEqual([1, 2, 3]);
  });

  test('preserves length', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  test('contains the same elements', () => {
    const result = shuffle([1, 2, 3, 4, 5]);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('empty array returns empty', () => {
    expect(shuffle([])).toEqual([]);
  });

  test('single element returns same', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});
