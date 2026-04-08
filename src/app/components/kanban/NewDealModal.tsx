"use client";

import { useState } from "react";
import { createDeal } from "@/app/actions";
import { Stage, User } from "@/app/types";

interface NewDealModalProps {
  stages: Stage[];
  users: User[];
  onClose: () => void;
  onSuccess: () => void;
}

export function NewDealModal({ stages, users, onClose, onSuccess }: NewDealModalProps) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [stageId, setStageId] = useState(stages[0]?.id ?? 1);
  const [userId, setUserId] = useState<number | undefined>();
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return;

    setLoading(true);
    try {
      await createDeal({
        title,
        clientName,
        phone: phone || undefined,
        amount: amount ? parseInt(amount) : undefined,
        description: description || undefined,
        stageId,
        userId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-[#1a1a1a] p-6 border border-[#2a2a2a]">
        <h2 className="mb-4 text-xl font-semibold text-white">New Deal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white placeholder-[#666]"
              placeholder="Deal title"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Client</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white placeholder-[#666]"
              placeholder="Client name"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white placeholder-[#666]"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white placeholder-[#666]"
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Stage</label>
            <select
              value={stageId}
              onChange={(e) => setStageId(parseInt(e.target.value))}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
          {users.length > 0 && (
            <div>
              <label className="mb-1 block text-sm text-[#a1a1a1]">Assigned User</label>
              <select
                value={userId ?? ""}
                onChange={(e) => setUserId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
              >
                <option value="">Select user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
          </div>
          )}
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white placeholder-[#666]"
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-[#2a2a2a] py-2 text-white hover:bg-[#252525]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-[#22c55e] py-2 text-white hover:bg-[#16a34a] disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
