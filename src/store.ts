import type { Receipt, User } from './types.js';

export const users: User[] = [
  { id: 'u_maya', email: 'maya@fairshare.dev', name: 'Maya Chen', role: 'member' },
  { id: 'u_omar', email: 'omar@fairshare.dev', name: 'Omar Haddad', role: 'member' },
  { id: 'u_lena', email: 'lena@fairshare.dev', name: 'Lena Brooks', role: 'admin' },
];

export const receipts: Receipt[] = [
  {
    id: 'r_1001',
    ownerId: 'u_maya',
    merchant: 'Blue Bottle Coffee',
    date: '2026-10-28',
    currency: 'USD',
    items: [
      { description: 'Oat latte', amountCents: 675 },
      { description: 'Cold brew', amountCents: 550 },
      { description: 'Almond croissant', amountCents: 495 },
    ],
    participants: ['Maya', 'Omar', 'Lena'],
  },
  {
    id: 'r_1002',
    ownerId: 'u_maya',
    merchant: 'Team offsite dinner',
    date: '2026-10-30',
    currency: 'USD',
    items: [
      { description: 'Tasting menu x3', amountCents: 28500 },
      { description: 'Wine pairing', amountCents: 9000 },
      { description: 'Service', amountCents: 6751 },
    ],
    participants: ['Maya', 'Omar', 'Lena'],
  },
  {
    id: 'r_1003',
    ownerId: 'u_maya',
    merchant: 'Lyft to SFO',
    date: '2026-10-31',
    currency: 'USD',
    items: [{ description: 'Ride', amountCents: 6400 }],
    participants: ['Maya', 'Omar'],
  },
  {
    id: 'r_2001',
    ownerId: 'u_omar',
    merchant: 'Hardware store',
    date: '2026-10-29',
    currency: 'USD',
    items: [{ description: 'Shelving', amountCents: 12999 }],
    participants: ['Omar', 'Lena'],
  },
];

export function receiptsFor(ownerId: string): Receipt[] {
  return receipts.filter((r) => r.ownerId === ownerId);
}

export function findReceipt(id: string): Receipt | undefined {
  return receipts.find((r) => r.id === id);
}
