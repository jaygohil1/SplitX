import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { User, Expense, SettlementInstruction, BalanceResponse } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { api } from '../api';

interface SettlementEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  users: User[];
  expenses: Expense[];
  backendBalances?: BalanceResponse[];
  onSettle: () => void;
}

export function SettlementEngineModal({
  isOpen,
  onClose,
  groupId,
  users,
  expenses,
  backendBalances,
  onSettle,
}: SettlementEngineModalProps) {
  const [settlingPair, setSettlingPair] = useState<string | null>(null);
  const [settleError, setSettleError] = useState<string>('');

  // Calculate settlement instructions using backend balances if available or smart settlement algorithm
  const settlements = useMemo(() => {
    // 1. If backend balances are provided and non-empty, map them directly to instructions
    if (backendBalances && backendBalances.length > 0) {
      const list: SettlementInstruction[] = [];
      for (const b of backendBalances) {
        let fromId = b.fromUserId;
        let toId = b.toUserId;

        if (!fromId) {
          const fromU = users.find(u => u.name.toLowerCase() === b.fromUser.toLowerCase() || u.email.toLowerCase() === b.fromUser.toLowerCase());
          fromId = fromU?.id;
        }
        if (!toId) {
          const toU = users.find(u => u.name.toLowerCase() === b.toUser.toLowerCase() || u.email.toLowerCase() === b.toUser.toLowerCase());
          toId = toU?.id;
        }

        if (fromId && toId && b.amount > 0.01) {
          list.push({
            fromMemberId: fromId,
            toMemberId: toId,
            amount: Number(b.amount),
            isSettled: false,
          });
        }
      }
      if (list.length > 0) return list;
    }

    // 2. Local smart settlement algorithm fallback
    const balances: Record<number, number> = {};
    users.forEach(u => balances[u.id] = 0);

    expenses.forEach(exp => {
      if (Array.isArray(exp.paidBy)) {
        exp.paidBy.forEach(payer => {
          if (balances[payer.userId] !== undefined) {
            balances[payer.userId] += payer.amount;
          }
        });
      } else if (balances[exp.paidBy] !== undefined) {
        balances[exp.paidBy] += exp.amount;
      }

      exp.shares.forEach(share => {
        if (!share.isSettled && balances[share.userId] !== undefined) {
          balances[share.userId] -= share.amount;
        }
      });
    });

    const debtors = Object.entries(balances)
      .filter(([_, bal]) => bal < -0.01)
      .map(([id, bal]) => ({ id: Number(id), amount: Math.abs(bal) }))
      .sort((a, b) => b.amount - a.amount);

    const creditors = Object.entries(balances)
      .filter(([_, bal]) => bal > 0.01)
      .map(([id, bal]) => ({ id: Number(id), amount: bal }))
      .sort((a, b) => b.amount - a.amount);

    const instructions: SettlementInstruction[] = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settledAmount = Math.min(debtor.amount, creditor.amount);

      instructions.push({
        fromMemberId: debtor.id,
        toMemberId: creditor.id,
        amount: settledAmount,
        isSettled: false,
      });

      debtor.amount -= settledAmount;
      creditor.amount -= settledAmount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return instructions;
  }, [users, expenses, backendBalances]);

  const handleSettle = async (instruction: SettlementInstruction, e: React.MouseEvent) => {
    const pairKey = `${instruction.fromMemberId}-${instruction.toMemberId}`;
    setSettlingPair(pairKey);
    setSettleError('');

    try {
      // 1. Call backend settlement endpoint to persist isSettled = true in MySQL
      await api.settleExpense({
        groupId,
        userId: instruction.fromMemberId,
        payerId: instruction.toMemberId,
      });

      // 2. Trigger confetti animation
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#10b981', '#34d399', '#f43f5e']
      });

      // 3. Trigger refresh of expenses and balances from backend
      onSettle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to settle debt.';
      setSettleError(message);
    } finally {
      setSettlingPair(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Smart Settlement Engine" className="max-w-2xl">
      <div className="mb-6">
        <p className="text-slate-400 text-sm">
          SplitX calculates the absolute minimum number of transfers required to settle all group debts.
        </p>
      </div>

      {settleError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {settleError}
        </div>
      )}

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {settlements.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">All Settled Up!</h3>
            <p className="text-slate-400">No pending balances in this group.</p>
          </div>
        ) : (
          <AnimatePresence>
            {settlements.map((settlement, idx) => {
              const fromUser = users.find(u => u.id === settlement.fromMemberId) || {
                id: settlement.fromMemberId,
                name: `User #${settlement.fromMemberId}`,
                email: '',
                avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${settlement.fromMemberId}`,
              };
              const toUser = users.find(u => u.id === settlement.toMemberId) || {
                id: settlement.toMemberId,
                name: `User #${settlement.toMemberId}`,
                email: '',
                avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${settlement.toMemberId}`,
              };
              const pairKey = `${settlement.fromMemberId}-${settlement.toMemberId}`;
              const isSettling = settlingPair === pairKey;

              return (
                <motion.div
                  key={`${settlement.fromMemberId}-${settlement.toMemberId}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800/80"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <img
                      src={fromUser.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${fromUser.name}`}
                      alt=""
                      className="w-10 h-10 rounded-full bg-slate-700 border-2 border-rose-400 object-cover"
                    />
                    <span className="text-[11px] font-bold uppercase text-slate-300 truncate w-20 text-center">
                      {fromUser.name.split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-4">
                    <div className="w-full h-px bg-slate-700 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 mt-2">
                      {formatCurrency(settlement.amount)}
                    </span>
                    <button
                      type="button"
                      disabled={isSettling}
                      onClick={(e) => handleSettle(settlement, e)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline mt-1 uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      {isSettling ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Settling...
                        </>
                      ) : (
                        'Mark as paid'
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <img
                      src={toUser.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${toUser.name}`}
                      alt=""
                      className="w-10 h-10 rounded-full bg-slate-700 border-2 border-emerald-400 object-cover"
                    />
                    <span className="text-[11px] font-bold uppercase text-slate-300 truncate w-20 text-center">
                      {toUser.name.split(' ')[0]}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {settlements.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Optimized to {settlements.length} payment{settlements.length !== 1 ? 's' : ''}</span>
          <span className="flex items-center gap-1">Backend Persisted Balance</span>
        </div>
      )}
    </Modal>
  );
}
