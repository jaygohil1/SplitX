import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '@/lib/utils';
import { Expense, User } from '@/types';
import { format, parseISO } from 'date-fns';
import { Coffee, Plane, Home, Music, HelpCircle, Receipt } from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  food: Coffee,
  travel: Plane,
  stay: Home,
  entertainment: Music,
  other: HelpCircle,
};

const categoryColors: Record<string, string> = {
  food: 'text-orange-400',
  travel: 'text-blue-400',
  stay: 'text-purple-400',
  entertainment: 'text-pink-400',
  other: 'text-slate-400',
};

interface ExpenseListProps {
  expenses: Expense[];
  users: User[];
  currentUserId: number;
}

export function ExpenseList({ expenses, users, currentUserId }: ExpenseListProps) {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredExpenses = useMemo(() => {
    let result = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filter !== 'all') {
      result = result.filter(e => e.category === filter);
    }
    return result;
  }, [expenses, filter]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          Recent Expenses
        </h3>
        
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {['all', 'food', 'travel', 'stay', 'entertainment'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                filter === cat 
                  ? "bg-slate-700 text-slate-100" 
                  : "text-slate-500 hover:text-emerald-400"
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto min-h-0 flex-1">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed">
            <p className="text-slate-500">No expenses found.</p>
          </div>
        ) : (
          filteredExpenses.map((expense, i) => {
            const category = expense.category || 'other';
            const Icon = categoryIcons[category] || HelpCircle;
            const isMultiPayer = Array.isArray(expense.paidBy);
            const payer = isMultiPayer ? null : users.find(u => u.id === expense.paidBy as number);
            const payerName = isMultiPayer ? 'Multiple' : payer?.id === currentUserId ? 'You' : (payer?.name?.split(' ')[0] || `User #${expense.paidBy}`);
            const myShare = expense.shares.find(s => s.userId === currentUserId);
            
            // Determine if I'm involved, and if I owe or lent
            const didIPay = Array.isArray(expense.paidBy) 
              ? expense.paidBy.some(p => p.userId === currentUserId)
              : expense.paidBy === currentUserId;
              
            let shareText = '';
            let shareAmount = 0;
            let shareColor = 'text-slate-500 dark:text-slate-400';
            
            if (didIPay) {
              const myPayment = Array.isArray(expense.paidBy) 
                ? expense.paidBy.find(p => p.userId === currentUserId)?.amount || 0
                : expense.amount;
                
              const lentAmount = myPayment - (myShare?.amount || 0);
              
              if (lentAmount > 0) {
                shareText = 'You get back';
                shareAmount = lentAmount;
                shareColor = 'text-emerald-500 dark:text-emerald-400';
              } else if (lentAmount < 0) {
                shareText = 'You owe';
                shareAmount = Math.abs(lentAmount);
                shareColor = 'text-rose-500 dark:text-rose-400';
              } else {
                shareText = 'Settled';
              }
            } else if (myShare) {
              if (myShare.isSettled) {
                shareText = 'Settled';
                shareAmount = 0;
                shareColor = 'text-slate-400';
              } else {
                shareText = 'You owe';
                shareAmount = myShare.amount;
                shareColor = 'text-rose-500 dark:text-rose-400';
              }
            } else {
              shareText = 'Not involved';
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={expense.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/80 backdrop-blur-md shadow-sm transition-all hover:bg-white/60 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("h-12 w-12 rounded-2xl bg-white/50 dark:bg-slate-800 flex items-center justify-center text-xl shadow-inner backdrop-blur-sm", categoryColors[category])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{expense.description}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-500">
                      Paid by <span className="text-slate-800 dark:text-slate-300 font-medium">{payerName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="sm:text-right shrink-0 flex sm:block justify-between items-center mt-2 sm:mt-0">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(expense.amount)}</div>
                  {shareAmount > 0 ? (
                    <div className={cn("text-[10px] uppercase tracking-wider mt-0.5 font-bold", shareColor)}>
                      {shareText} {formatCurrency(shareAmount)}
                    </div>
                  ) : (
                    <div className="text-[10px] uppercase tracking-wider mt-0.5 text-slate-500 font-bold">{shareText}</div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
