export interface LineItem {
  description: string;
  amountCents: number;
}

export interface Receipt {
  id: string;
  ownerId: string;
  merchant: string;
  date: string;
  currency: 'USD' | 'EUR' | 'GBP';
  items: LineItem[];
  participants: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'admin';
}
