import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { api } from '../api';

interface ManageGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
  onGroupCreated?: (groupId: number) => void;
}

export function CreateGroupModal({ isOpen, onClose, currentUserId, onGroupCreated }: ManageGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send group creation request to Spring Boot backend
      const response = await api.createGroup({
        groupName,
        description,
        createdBy: currentUserId,
      });

      const newGroupId = parseInt(String(response).trim(), 10);
      setGroupName('');
      setDescription('');
      onClose();

      if (onGroupCreated && !isNaN(newGroupId)) {
        onGroupCreated(newGroupId);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create group.';
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

        <h2 className="text-2xl font-bold mb-6">Create New Group</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Group Name</label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Goa Trip 2026"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        </form>
      </div>
    </div>
  );
}