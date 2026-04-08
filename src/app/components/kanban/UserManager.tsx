"use client";

import { useState } from "react";
import { User } from "@/app/types";
import { createUser, deleteUser } from "@/app/actions";

interface UserManagerProps {
  users: User[];
  onUpdate: () => void;
}

export function UserManager({ users, onUpdate }: UserManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setLoading(true);
    try {
      await createUser({ name: newName, email: newEmail });
      setNewName("");
      setNewEmail("");
      setShowAdd(false);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    setLoading(true);
    try {
      await deleteUser(id);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Users</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm text-[#22c55e] hover:underline"
        >
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2 p-3 bg-[#252525] rounded-lg flex-wrap">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="flex-1 min-w-[120px] bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-white text-sm"
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email"
            className="flex-1 min-w-[120px] bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-white text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={loading || !newName.trim() || !newEmail.trim()}
            className="px-3 py-1 bg-[#22c55e] text-white rounded text-sm"
          >
            Add
          </button>
        </div>
      )}

      <div className="space-y-1">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2 p-2 bg-[#252525] rounded">
            <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">{user.name}</p>
              <p className="text-[#666] text-xs">{user.email}</p>
            </div>
            <span className="text-xs text-[#a1a1a1] bg-[#1a1a1a] px-2 py-1 rounded">{user.role}</span>
            <button
              onClick={() => handleDelete(user.id)}
              className="text-[#ef4444] hover:text-white text-xs"
            >
              Delete
            </button>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-[#666] text-sm text-center py-4">No users yet</p>
        )}
      </div>
    </div>
  );
}
