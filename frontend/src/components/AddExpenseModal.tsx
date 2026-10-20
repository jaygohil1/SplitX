import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User } from '../types';
import { api } from '../api';
import { Check, Users } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserId: number;
  groupId: number;
  onAddExpense: () => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  users,
  currentUserId,
  groupId,
  onAddExpense,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState<number>(currentUserId);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When modal opens or users list changes, default payer to current user and select all members
  useEffect(() => {
    if (isOpen) {
      setPayerId(currentUserId || (users[0]?.id ?? 1));
      setSelectedMemberIds(users.map(u => u.id));
      setError('');
    }
  }, [isOpen, users, currentUserId]);

  if (!isOpen) return null;

  const toggleMember = (id: number) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length === 1) {
        setError('At least one member must be selected for the split.');
        return;
      }
      setSelectedMemberIds(selectedMemberIds.filter(mId => mId !== id));
      setError('');
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
      setError('');
    }
  };

  const selectAll = () => {
    setSelectedMemberIds(users.map(u => u.id));
    setError('');
  };

  const parsedAmount = parseFloat(amount);
  const splitCount = selectedMemberIds.length;
  const estimatedShare = (!isNaN(parsedAmount) && splitCount > 0)
    ? (parsedAmount / splitCount).toFixed(2)
    : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (selectedMemberIds.length === 0) {
      setError('Please select at least one member to split the expense with.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create the Expense in the backend
      const createdExpense = await api.addExpense({
        groupId,
        paidBy: payerId,
        amount: parsedAmount,
        description: description.trim(),
      });

      // 2. Compute exact financial split with penny rounding
      const totalCents = Math.round(parsedAmount * 100);
      const count = selectedMemberIds.length;
      const baseCents = Math.floor(totalCents / count);
      const remainderCents = totalCents % count;

      // 3. Create ExpenseShare records for each involved member
      const sharePromises = selectedMemberIds.map((userId, index) => {
        const shareCents = index < remainderCents ? baseCents + 1 : baseCents;
        const shareAmount = shareCents / 100;

        return api.addExpenseShare({
          expenseId: createdExpense.id,
          userId,
          shareAmount,
        });
      });

      await Promise.all(sharePromises);

      // 4. Reset & Notify parent to refresh state from backend
      setDescription('');
      setAmount('');
      onAddExpense();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add expense';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6">Add New Expense</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner, Fuel, Airbnb"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹)</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Paid By</label>
            <select
              value={payerId}
              onChange={(e) => setPayerId(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.id === currentUserId ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-400">
                Split Equally Among ({selectedMemberIds.length})
              </label>
              {selectedMemberIds.length < users.length && (
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Select All
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {users.map((u) => {
                const isSelected = selectedMemberIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleMember(u.id)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors border ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-100'
                        : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border text-slate-950 ${
                          isSelected ? 'bg-emerald-400 border-emerald-400' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-medium">
                        {u.name} {u.id === currentUserId ? '(You)' : ''}
                      </span>
                    </div>

                    {isSelected && !isNaN(parsedAmount) && parsedAmount > 0 && (
                      <span className="text-xs text-emerald-400 font-semibold">
                        ₹{estimatedShare}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-4 font-bold">
            {loading ? 'Saving & Splitting...' : 'Add Expense'}
          </Button>
        </form>
      </div>
    </div>
  );
}