export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  createdAt?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  createdBy?: number;
  createdAt?: string;
  members: User[];
}

export interface BackendGroup {
  id: number;
  groupName: string;
  description: string;
  createdBy: number;
  createdAt: string;
}

export interface ExpenseShare {
  id?: number;
  expenseId?: number;
  userId: number;
  amount: number;
  isSettled: boolean;
}

export interface BackendExpenseShare {
  id: number;
  expenseId: number;
  userId: number;
  shareAmount: number;
  isSettled: boolean;
}

export interface Expense {
  id: number;
  groupId: number;
  description: string;
  amount: number;
  paidBy: number | { userId: number; amount: number }[]; // Single user id or multiple payers
  date: string;
  category: 'food' | 'travel' | 'stay' | 'entertainment' | 'other';
  shares: ExpenseShare[];
}

export interface BackendExpense {
  id: number;
  groupId: number;
  paidBy: number;
  amount: number;
  description: string;
  createdAt: string;
}

export interface SettlementInstruction {
  fromMemberId: number;
  toMemberId: number;
  amount: number;
  isSettled: boolean;
}

export interface BalanceResponse {
  fromUserId?: number;
  fromUser: string;
  toUserId?: number;
  toUser: string;
  amount: number;
}

