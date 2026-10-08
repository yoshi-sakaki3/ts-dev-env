import { describe, expect, it } from 'vitest';
import { formatYen, withTax } from './money.js';

describe('withTax', () => {
  it('税込金額を出す（1円未満は切り捨て）', () => {
    expect(withTax(100000)).toBe(110000);
    expect(withTax(999)).toBe(1098); // 1098.9 → 切り捨て
  });

  it('マイナスや小数は受け付けない', () => {
    expect(() => withTax(-1)).toThrow(RangeError);
    expect(() => withTax(1.5)).toThrow(RangeError);
  });
});

describe('formatYen', () => {
  it('3桁区切りと「円」を付ける', () => {
    expect(formatYen(147000)).toBe('147,000円');
  });
});
