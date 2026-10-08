/** 消費税率（%）。小数の誤差を避けるため整数で持つ */
export const TAX_PERCENT = 10;

/** 税抜金額から税込金額を出す（1円未満は切り捨て） */
export function withTax(amount: number): number {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new RangeError('金額は0以上の整数にしてください。');
  }
  return Math.floor((amount * (100 + TAX_PERCENT)) / 100);
}

/** 3桁ごとにカンマを入れて「円」を付ける */
export function formatYen(amount: number): string {
  return `${amount.toLocaleString('ja-JP')}円`;
}
