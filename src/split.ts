import type { Receipt } from './types.js';

export function receiptTotal(receipt: Receipt): number {
  return receipt.items.reduce((sum, item) => sum + item.amountCents, 0);
}

/**
 * Splits a total across participants in whole cents. Remainder cents go to the
 * first participants so the shares always add back up to the total.
 */
export function splitEvenly(totalCents: number, participants: string[]): Record<string, number> {
  if (participants.length === 0) return {};
  const base = Math.floor(totalCents / participants.length);
  let remainder = totalCents - base * participants.length;
  const shares: Record<string, number> = {};
  for (const name of participants) {
    shares[name] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }
  return shares;
}

export function formatCents(cents: number, currency: Receipt['currency']): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
