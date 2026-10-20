import { User, Group, Expense, SettlementInstruction } from './types';

export const mockUsers: User[] = [
  { id: 1, name: 'Alice Sharma', email: 'alice@example.com', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Alice' },
  { id: 2, name: 'Bob Verma', email: 'bob@example.com', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Bob' },
  { id: 3, name: 'Charlie Singh', email: 'charlie@example.com', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Charlie' },
  { id: 4, name: 'Diana Patel', email: 'diana@example.com', avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Diana' },
];

export const mockGroup: Group = {
  id: 1,
  name: 'Goa Trip 2026',
  description: 'Weekend getaway to Goa',
  members: mockUsers,
};

export const mockExpenses: Expense[] = [
  {
    id: 1,
    groupId: 1,
    description: 'Flights to Goa',
    amount: 24000,
    paidBy: 1,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    category: 'travel',
    shares: [
      { userId: 1, amount: 6000, isSettled: false },
      { userId: 2, amount: 6000, isSettled: false },
      { userId: 3, amount: 6000, isSettled: false },
      { userId: 4, amount: 6000, isSettled: false },
    ],
  },
  {
    id: 2,
    groupId: 1,
    description: 'Villa Booking',
    amount: 32000,
    paidBy: 2,
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    category: 'stay',
    shares: [
      { userId: 1, amount: 8000, isSettled: false },
      { userId: 2, amount: 8000, isSettled: false },
      { userId: 3, amount: 8000, isSettled: false },
      { userId: 4, amount: 8000, isSettled: false },
    ],
  },
  {
    id: 3,
    groupId: 1,
    description: 'Seafood Dinner',
    amount: 8500,
    paidBy: 3,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    category: 'food',
    shares: [
      { userId: 1, amount: 2500, isSettled: false },
      { userId: 2, amount: 2000, isSettled: false },
      { userId: 3, amount: 2000, isSettled: false },
      { userId: 4, amount: 2000, isSettled: false },
    ],
  },
  {
    id: 4,
    groupId: 1,
    description: 'Club Entry',
    amount: 6000,
    paidBy: 4,
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    category: 'entertainment',
    shares: [
      { userId: 1, amount: 1500, isSettled: false },
      { userId: 2, amount: 1500, isSettled: false },
      { userId: 3, amount: 1500, isSettled: false },
      { userId: 4, amount: 1500, isSettled: false },
    ],
  },
];
