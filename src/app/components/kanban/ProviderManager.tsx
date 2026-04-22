"use client";

import { useState } from "react";
import { Provider } from "@/app/types";
import { createProvider, deleteProvider } from "@/app/actions";

interface ProviderManagerProps {
  providers: Provider[];
  onUpdate: () => void;
}

export function ProviderManager({ providers, onUpdate }: ProviderManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    setLoading(true);
    try {
      await createProvider({ name: newName, email: newEmail, phone: newPhone || undefined });
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setShowAdd(false);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this provider? All associated users and deals will be affected.")) return;
    setLoading(true);
    try {
      await deleteProvider(id);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Providers</h3>
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
          <input
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Phone"
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
        {providers.map((provider) => (
          <div key={provider.id} className="flex items-center gap-2 p-2 bg-[#252525] rounded">
            <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center text-white text-sm font-bold">
              {provider.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">{provider.name}</p>
              <p className="text-[#666] text-xs">{provider.email}</p>
            </div>
            <button
              onClick={() => handleDelete(provider.id)}
              className="text-[#ef4444] hover:text-white text-xs"
            >
              Delete
            </button>
          </div>
        ))}
        {providers.length === 0 && (
          <p className="text-[#666] text-sm text-center py-4">No providers yet</p>
        )}
      </div>
    </div>
  );
}