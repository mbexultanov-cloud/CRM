"use client";

import { useState } from "react";
import { Deal, Stage } from "@/app/types";
import { updateDeal, deleteDeal } from "@/app/actions";

interface EditDealModalProps {
  deal: Deal;
  stages: Stage[];
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDealModal({ deal, stages, onClose, onSuccess }: EditDealModalProps) {
  const [title, setTitle] = useState(deal.title);
  const [clientName, setClientName] = useState(deal.clientName);
  const [amount, setAmount] = useState(deal.amount?.toString() || "");
  const [description, setDescription] = useState(deal.description || "");
  const [stageId, setStageId] = useState(deal.stageId);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return;

    setLoading(true);
    try {
      await updateDeal(deal.id, {
        title,
        clientName,
        amount: amount ? parseInt(amount) : undefined,
        description: description || undefined,
        stageId,
      });
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDeal(deal.id);
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
        <h2 className="mb-4 text-xl font-semibold text-white">Edit Deal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Client</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
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
          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="rounded-md border border-[#ef4444] px-3 py-2 text-[#ef4444] hover:bg-[#ef4444]/10"
            >
              Delete
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[#2a2a2a] py-2 px-4 text-white hover:bg-[#252525]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#22c55e] py-2 px-4 text-white hover:bg-[#16a34a] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        {showDelete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#2a2a2a]">
              <p className="mb-4 text-white">Delete this deal?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDelete(false)}
                  className="rounded-md border border-[#2a2a2a] px-4 py-2 text-white hover:bg-[#252525]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-md bg-[#ef4444] px-4 py-2 text-white hover:bg-[#dc2626]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}