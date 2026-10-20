import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { api } from '../api';
import { UserPlus } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  groupName: string;
  onMemberAdded?: () => void;
}

export function AddMemberModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  onMemberAdded,
}: AddMemberModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        throw new Error('Please enter a valid email address.');
      }

      await api.addMemberByEmail({
        groupId,
        email: trimmedEmail,
      });

      setSuccess(`Added ${trimmedEmail} to "${groupName}"!`);
      setEmail('');
      if (onMemberAdded) {
        onMemberAdded();
      }
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add member.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Add Member</h2>
            <p className="text-xs text-slate-400">Add a friend to {groupName}</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Member's Registered Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              The user must already have a SplitX account registered with this email.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Adding...' : 'Add to Group'}
          </Button>
        </form>
      </div>
    </div>
  );
}
