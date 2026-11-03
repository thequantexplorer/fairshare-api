import type { Receipt } from './types.js';

export function receiptTotal(receipt: Receipt): number {
  return receipt.items.reduce((sum, item) => sum + item.amountCents, 0);
}

/**
 * Splits a total into `count` whole-cent amounts. Remainder cents go to the
 * first positions so the amounts always add back up to the total.
 */
export function splitAmounts(totalCents: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

/**
 * Splits a total across participants in whole cents. Remainder cents go to the
 * first participants so the shares always add back up to the total.
 */
export function splitEvenly(totalCents: number, participants: string[]): Record<string, number> {
  const amounts = splitAmounts(totalCents, participants.length);
  const shares: Record<string, number> = {};
  participants.forEach((name, i) => {
    shares[name] = amounts[i]!;
  });
  return shares;
}

export function formatCents(cents: number, currency: Receipt['currency']): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
