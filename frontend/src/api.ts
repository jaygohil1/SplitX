import {
  UserResponse,
  BackendGroup,
  BackendExpense,
  BackendExpenseShare,
  BalanceResponse,
} from './types';

// Spring Boot backend base URL (configurable via Vite env)
const BASE_URL =
  (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env
    ?.VITE_API_BASE_URL || 'http://localhost:8080';

// Request DTO interfaces matching backend expectations
export interface RegisterUserRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface AddExpenseRequest {
  groupId: number;
  paidBy: number;
  amount: number;
  description: string;
}

export interface AddExpenseShareRequest {
  expenseId: number;
  userId: number;
  shareAmount: number;
}

export interface AddGroupMemberRequest {
  groupId: number;
  userId: number;
}

export interface AddGroupMemberByEmailRequest {
  groupId: number;
  email: string;
}

export interface CreateGroupRequest {
  groupName: string;
  description?: string;
  createdBy: number;
}

export interface SettlementRequest {
  expenseId?: number;
  userId?: number;
  groupId?: number;
  payerId?: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP Error ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text() as unknown as T;
}

// API Service calls mapped to Spring Boot backend
export const api = {
  // Authentication & Users
  registerUser: (data: RegisterUserRequest) =>
    request<string>('/api/users/register', { method: 'POST', body: JSON.stringify(data) }),

  loginUser: (data: LoginUserRequest) =>
    request<UserResponse>('/api/users/login', { method: 'POST', body: JSON.stringify(data) }),

  getUserById: (id: number) =>
    request<UserResponse>(`/api/users/id/${id}`, { method: 'GET' }),

  getUserByEmail: (email: string) =>
    request<UserResponse>(`/api/users/email/${encodeURIComponent(email)}`, { method: 'GET' }),

  searchUsers: (query: string = '') =>
    request<UserResponse[]>(`/api/users/search?query=${encodeURIComponent(query)}`, { method: 'GET' }),

  // Groups
  createGroup: (data: CreateGroupRequest) =>
    request<string>('/api/groups/create', { method: 'POST', body: JSON.stringify(data) }),

  getGroupById: (groupId: number) =>
    request<BackendGroup>(`/api/groups/id/${groupId}`, { method: 'GET' }),

  getGroupsByUser: (userId: number) =>
    request<BackendGroup[]>(`/api/groups/user/${userId}`, { method: 'GET' }),

  // Group Members
  getGroupMembers: (groupId: number) =>
    request<UserResponse[]>(`/api/group-members/group/${groupId}`, { method: 'GET' }),

  addMember: (data: AddGroupMemberRequest) =>
    request<string>('/api/group-members/add', { method: 'POST', body: JSON.stringify(data) }),

  addMemberByEmail: (data: AddGroupMemberByEmailRequest) =>
    request<string>('/api/group-members/add-by-email', { method: 'POST', body: JSON.stringify(data) }),

  // Expenses & Shares
  addExpense: (data: AddExpenseRequest) =>
    request<BackendExpense>('/api/expenses/add', { method: 'POST', body: JSON.stringify(data) }),

  getExpensesByGroup: (groupId: number) =>
    request<BackendExpense[]>(`/api/expenses/group/${groupId}`, { method: 'GET' }),

  addExpenseShare: (data: AddExpenseShareRequest) =>
    request<string>('/api/expense-shares/add', { method: 'POST', body: JSON.stringify(data) }),

  getExpenseSharesByGroup: (groupId: number) =>
    request<BackendExpenseShare[]>(`/api/expense-shares/group/${groupId}`, { method: 'GET' }),

  getExpenseSharesByExpense: (expenseId: number) =>
    request<BackendExpenseShare[]>(`/api/expense-shares/expense/${expenseId}`, { method: 'GET' }),

  // Balances & Settlements
  getBalances: (groupId: number) =>
    request<BalanceResponse[]>(`/api/balances/group/${groupId}`, { method: 'GET' }),

  settleExpense: (data: SettlementRequest) =>
    request<string>('/api/settlements/pay', { method: 'POST', body: JSON.stringify(data) }),
};