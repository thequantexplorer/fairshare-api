import { describe, expect, it } from 'vitest';
import { formatCents, splitAmounts, splitEvenly } from '../src/split.js';

describe('splitEvenly', () => {
  it('splits evenly when the total divides cleanly', () => {
    expect(splitEvenly(900, ['a', 'b', 'c'])).toEqual({ a: 300, b: 300, c: 300 });
  });

  it('gives remainder cents to the first participants', () => {
    expect(splitEvenly(1000, ['a', 'b', 'c'])).toEqual({ a: 334, b: 333, c: 333 });
  });

  it('returns no shares for an empty receipt', () => {
    expect(splitEvenly(500, [])).toEqual({});
  });
});

describe('splitAmounts', () => {
  it('returns one amount per position that sums to the total', () => {
    expect(splitAmounts(501, 2)).toEqual([251, 250]);
    expect(splitAmounts(1000, 3)).toEqual([334, 333, 333]);
  });

  it('returns no amounts for zero positions', () => {
    expect(splitAmounts(500, 0)).toEqual([]);
  });
});

describe('formatCents', () => {
  it('formats USD', () => {
    expect(formatCents(44251, 'USD')).toBe('$442.51');
  });
});
