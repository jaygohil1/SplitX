import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency, cn } from '@/lib/utils';
import { User, Group, Expense, BalanceResponse, UserResponse } from '@/types';
import { ExpenseList } from './ExpenseList';
import { AddExpenseModal } from './AddExpenseModal';
import { SettlementEngineModal } from './SettlementModal';
import { CreateGroupModal } from './CreateGroupModal';
import { AddMemberModal } from './AddMemberModal';
import { LogOut, Zap, Users, Plus, UserPlus, Layers, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { api } from '../api';

function categorizeExpense(description: string): 'food' | 'travel' | 'stay' | 'entertainment' | 'other' {
  const lower = description.toLowerCase();
  if (lower.includes('dinner') || lower.includes('lunch') || lower.includes('food') || lower.includes('cafe') || lower.includes('pizza') || lower.includes('drinks') || lower.includes('breakfast') || lower.includes('coffee')) {
    return 'food';
  }
  if (lower.includes('flight') || lower.includes('fuel') || lower.includes('cab') || lower.includes('uber') || lower.includes('ola') || lower.includes('train') || lower.includes('travel') || lower.includes('ticket')) {
    return 'travel';
  }
  if (lower.includes('hotel') || lower.includes('villa') || lower.includes('resort') || lower.includes('airbnb') || lower.includes('stay') || lower.includes('room')) {
    return 'stay';
  }
  if (lower.includes('movie') || lower.includes('club') || lower.includes('party') || lower.includes('game') || lower.includes('event') || lower.includes('concert')) {
    return 'entertainment';
  }
  return 'other';
}

export function Dashboard() {
  const navigate = useNavigate();

  // 1. Authenticated User Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('splitx_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Auth Guard
  useEffect(() => {
    if (!currentUser) {
      const email = localStorage.getItem('userEmail');
      if (email) {
        // Try fetching user by email
        api.getUserByEmail(email)
          .then((u: UserResponse) => {
            const userObj: User = {
              id: u.id,
              name: u.fullName,
              email: u.email,
              phoneNumber: u.phoneNumber,
              avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(u.fullName || email)}`,
            };
            localStorage.setItem('splitx_user', JSON.stringify(userObj));
            setCurrentUser(userObj);
          })
          .catch(() => {
            navigate('/');
          });
      } else {
        navigate('/');
      }
    }
  }, [currentUser, navigate]);

  // 2. Groups State
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // 3. Expenses, Shares & Balances State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<BalanceResponse[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // 4. Modal States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Load User Groups from backend
  const loadUserGroups = useCallback(async (selectGroupId?: number) => {
    if (!currentUser?.id) {
      setLoadingGroups(false);
      return;
    }
    setLoadingGroups(true);

    try {
      const backendGroups = await api.getGroupsByUser(currentUser.id);

      if (!backendGroups || !Array.isArray(backendGroups) || backendGroups.length === 0) {
        setGroups([]);
        setCurrentGroup(null);
        setLoadingGroups(false);
        return;
      }

      // Load members for all groups in parallel
      const enrichedGroups: Group[] = await Promise.all(
        backendGroups.map(async (bg) => {
          let members: User[] = [];
          try {
            const backendMembers = await api.getGroupMembers(bg.id);
            members = backendMembers.map((m) => ({
              id: m.id,
              name: m.fullName,
              email: m.email,
              phoneNumber: m.phoneNumber,
              avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(m.fullName || m.email)}`,
            }));
          } catch {
            members = [];
          }

          return {
            id: bg.id,
            name: bg.groupName,
            description: bg.description,
            createdBy: bg.createdBy,
            createdAt: bg.createdAt,
            members,
          };
        })
      );

      setGroups(enrichedGroups);

      // Select group: specified ID > currently selected ID > first group
      setCurrentGroup((prevGroup) => {
        if (selectGroupId) {
          const matched = enrichedGroups.find((g) => g.id === selectGroupId);
          return matched || enrichedGroups[0] || null;
        }
        if (prevGroup) {
          const matched = enrichedGroups.find((g) => g.id === prevGroup.id);
          return matched || enrichedGroups[0] || null;
        }
        return enrichedGroups[0] || null;
      });
    } catch (err) {
      console.error('Failed to load user groups:', err);
      setGroups([]);
      setCurrentGroup(null);
    } finally {
      setLoadingGroups(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      loadUserGroups();
    }
  }, [currentUser?.id, loadUserGroups]);

  // Load Expenses, Shares and Balances for Current Group
  const loadGroupDetails = useCallback(async () => {
    if (!currentGroup?.id) {
      setExpenses([]);
      setBalances([]);
      return;
    }

    setLoadingData(true);

    try {
      const [backendExpenses, backendShares, backendBalances] = await Promise.all([
        api.getExpensesByGroup(currentGroup.id),
        api.getExpenseSharesByGroup(currentGroup.id).catch(() => []),
        api.getBalances(currentGroup.id).catch(() => []),
      ]);

      const mappedExpenses: Expense[] = backendExpenses.map((exp) => {
        const expShares = backendShares
          .filter((s) => s.expenseId === exp.id)
          .map((s) => ({
            id: s.id,
            expenseId: s.expenseId,
            userId: s.userId,
            amount: Number(s.shareAmount),
            isSettled: Boolean(s.isSettled),
          }));

        return {
          id: exp.id,
          groupId: exp.groupId,
          description: exp.description || 'Expense',
          amount: Number(exp.amount),
          paidBy: exp.paidBy,
          date: exp.createdAt || new Date().toISOString(),
          category: categorizeExpense(exp.description || ''),
          shares: expShares,
        };
      });

      setExpenses(mappedExpenses);
      setBalances(backendBalances);
    } catch (error) {
      console.error('Failed to load group details:', error);
    } finally {
      setLoadingData(false);
    }
  }, [currentGroup?.id]);

  useEffect(() => {
    loadGroupDetails();
  }, [loadGroupDetails]);

  // Refresh current group's members
  const refreshMembers = async () => {
    if (!currentGroup?.id) return;
    try {
      const backendMembers = await api.getGroupMembers(currentGroup.id);
      const members: User[] = backendMembers.map((m) => ({
        id: m.id,
        name: m.fullName,
        email: m.email,
        phoneNumber: m.phoneNumber,
        avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(m.fullName || m.email)}`,
      }));

      setCurrentGroup((prev) => (prev ? { ...prev, members } : prev));
      setGroups((prev) =>
        prev.map((g) => (g.id === currentGroup.id ? { ...g, members } : g))
      );
    } catch (err) {
      console.error('Failed to refresh members:', err);
    }
  };

  // Compute Net Balance & Spending Stats
  const { totalGroupExpense, myNetBalance } = useMemo(() => {
    let total = 0;
    expenses.forEach((exp) => {
      total += exp.amount;
    });

    if (!currentUser) return { totalGroupExpense: total, myNetBalance: 0 };

    // Calculate balance from backend balances (Source of Truth)
    let net = 0;
    if (balances && balances.length > 0) {
      for (const b of balances) {
        const isBorrower =
          b.fromUserId === currentUser.id ||
          b.fromUser.toLowerCase() === currentUser.name.toLowerCase();
        const isPayer =
          b.toUserId === currentUser.id ||
          b.toUser.toLowerCase() === currentUser.name.toLowerCase();

        if (isBorrower) {
          net -= Number(b.amount);
        }
        if (isPayer) {
          net += Number(b.amount);
        }
      }
    } else {
      // Fallback calculation from expenses & shares
      expenses.forEach((exp) => {
        if (exp.paidBy === currentUser.id) {
          net += exp.amount;
        }
        const myShare = exp.shares.find((s) => s.userId === currentUser.id);
        if (myShare && !myShare.isSettled) {
          net -= myShare.amount;
        }
      });
    }

    return { totalGroupExpense: total, myNetBalance: net };
  }, [expenses, balances, currentUser]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('splitx_user');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading SplitX...
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 hidden md:flex flex-col p-6 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SplitX</h1>
        </div>

        {/* User Profile Snippet */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
          <img
            src={currentUser.avatarUrl}
            alt=""
            className="w-9 h-9 rounded-full bg-slate-700 object-cover border border-emerald-500/30"
          />
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-slate-100 truncate">{currentUser.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
          </div>
        </div>

        {/* Groups Navigation List */}
        <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Groups</div>
            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> New
            </button>
          </div>

          {loadingGroups ? (
            <div className="px-3 py-4 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-500 text-center bg-slate-850/40 rounded-xl border border-dashed border-slate-800">
              No groups yet. Create one!
            </div>
          ) : (
            groups.map((group) => {
              const isActive = currentGroup?.id === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setCurrentGroup(group)}
                  className={cn(
                    'w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="text-sm truncate">{group.name}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {group.members.length}
                  </span>
                </button>
              );
            })
          )}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="mt-auto pt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-red-500/10 hover:text-red-400 rounded-xl text-slate-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-coral-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none z-0"></div>

        {currentGroup ? (
          <>
            {/* Header */}
            <header className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center z-10 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-emerald-500 dark:text-emerald-400 font-medium">
                    Active Group
                  </span>
                  {groups.length > 1 && (
                    <div className="md:hidden">
                      <select
                        value={currentGroup.id}
                        onChange={(e) => {
                          const g = groups.find((grp) => grp.id === Number(e.target.value));
                          if (g) setCurrentGroup(g);
                        }}
                        className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {currentGroup.name}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-slate-500 dark:text-slate-400 text-sm flex-wrap">
                  {currentGroup.description && <span>{currentGroup.description}</span>}
                  {currentGroup.description && <span>•</span>}
                  <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="flex items-center gap-1.5 hover:text-emerald-400 text-slate-400 transition-colors cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    <span>{currentGroup.members.length} Members</span>
                    <span className="text-xs text-emerald-400 font-medium ml-1 flex items-center gap-0.5">
                      <UserPlus className="h-3 w-3" /> Add
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                <ThemeToggle />
                <Button
                  onClick={() => setIsGroupModalOpen(true)}
                  variant="outline"
                  className="flex-1 md:flex-none border-slate-300 dark:border-slate-800"
                >
                  <Plus className="h-4 w-4 mr-1" /> New Group
                </Button>
                <Button
                  onClick={() => setIsSettlementOpen(true)}
                  variant="secondary"
                  className="flex-1 md:flex-none shadow-sm"
                >
                  Settle Up
                </Button>
                <Button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="flex-1 md:flex-none shadow-lg shadow-emerald-500/20 font-bold"
                >
                  + Add Expense
                </Button>
              </div>
            </header>

            <div className="px-6 md:px-8 flex-1 pb-8 z-10 space-y-8 min-h-0 flex flex-col">
              {/* Stats Section */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 shrink-0">
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-3xl p-5 shadow-xl transition-all hover:bg-white/50 dark:hover:bg-slate-900/50">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Total Group Spent
                  </span>
                  <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalGroupExpense)}
                  </div>
                </div>

                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-3xl p-5 shadow-xl transition-all hover:bg-white/50 dark:hover:bg-slate-900/50">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Your Net Balance
                  </span>
                  <div
                    className={cn(
                      'text-2xl font-bold mt-1',
                      Math.abs(myNetBalance) < 0.01
                        ? 'text-slate-400'
                        : myNetBalance > 0
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : 'text-rose-500 dark:text-rose-400'
                    )}
                  >
                    {myNetBalance > 0.01 ? '+' : ''}
                    {formatCurrency(Math.abs(myNetBalance) < 0.01 ? 0 : myNetBalance)}
                  </div>
                </div>

                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-3xl p-5 shadow-xl transition-all hover:bg-white/50 dark:hover:bg-slate-900/50">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Status
                  </span>
                  <div className="text-lg font-bold mt-1 text-slate-700 dark:text-slate-300">
                    {myNetBalance > 0.01
                      ? 'You are owed money'
                      : myNetBalance < -0.01
                      ? 'You owe money'
                      : 'All settled up'}
                  </div>
                </div>
              </section>

              {/* Expenses List */}
              <section className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-3xl p-6 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar shadow-xl">
                {loadingData ? (
                  <div className="flex items-center justify-center flex-1 py-12 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading expenses...
                  </div>
                ) : (
                  <ExpenseList
                    expenses={expenses}
                    users={currentGroup.members}
                    currentUserId={currentUser.id}
                  />
                )}
              </section>
            </div>
          </>
        ) : (
          /* Empty State when user has no groups */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Layers className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">No Groups Yet</h2>
            <p className="text-slate-400 max-w-sm mb-6 text-sm">
              Create a group for your trip, house expenses, or outing with friends to start splitting bills effortlessly.
            </p>
            <Button onClick={() => setIsGroupModalOpen(true)} size="lg" className="font-bold">
              <Plus className="h-4 w-4 mr-2" /> Create First Group
            </Button>
          </div>
        )}
      </main>

      {/* Modals */}
      {currentGroup && (
        <>
          <AddExpenseModal
            isOpen={isAddExpenseOpen}
            onClose={() => setIsAddExpenseOpen(false)}
            users={currentGroup.members}
            currentUserId={currentUser.id}
            groupId={currentGroup.id}
            onAddExpense={loadGroupDetails}
          />

          <SettlementEngineModal
            isOpen={isSettlementOpen}
            onClose={() => setIsSettlementOpen(false)}
            groupId={currentGroup.id}
            users={currentGroup.members}
            expenses={expenses}
            backendBalances={balances}
            onSettle={loadGroupDetails}
          />

          <AddMemberModal
            isOpen={isAddMemberOpen}
            onClose={() => setIsAddMemberOpen(false)}
            groupId={currentGroup.id}
            groupName={currentGroup.name}
            onMemberAdded={refreshMembers}
          />
        </>
      )}

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        currentUserId={currentUser.id}
        onGroupCreated={(createdGroupId) => loadUserGroups(createdGroupId)}
      />
    </div>
  );
}