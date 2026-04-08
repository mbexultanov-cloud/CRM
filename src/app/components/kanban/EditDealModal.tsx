"use client";

import { useState, useEffect, useRef } from "react";
import { Deal, Stage, Attachment, User } from "@/app/types";
import { updateDeal, deleteDeal, getAttachments, deleteAttachment } from "@/app/actions";

interface EditDealModalProps {
  deal: Deal;
  stages: Stage[];
  users: User[];
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDealModal({ deal, stages, users, onClose, onSuccess }: EditDealModalProps) {
  const [title, setTitle] = useState(deal.title);
  const [clientName, setClientName] = useState(deal.clientName);
  const [phone, setPhone] = useState(deal.phone || "");
  const [amount, setAmount] = useState(deal.amount?.toString() || "");
  const [description, setDescription] = useState(deal.description || "");
  const [stageId, setStageId] = useState(deal.stageId);
  const [userId, setUserId] = useState<number | undefined>(deal.userId ?? undefined);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAttachments(deal.id).then(setAttachments);
  }, [deal.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dealId", deal.id.toString());

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newAttachment = await res.json();
        setAttachments((prev) => [...prev, newAttachment]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAttachment = async (id: number) => {
    await deleteAttachment(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return;

    setLoading(true);
    try {
      await updateDeal(deal.id, {
        title,
        clientName,
        phone: phone || undefined,
        amount: amount ? parseInt(amount) : undefined,
        description: description || undefined,
        stageId,
        userId,
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

  const isImage = (type?: string | null) => type?.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-[#1a1a1a] p-6 border border-[#2a2a2a]">
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
            <label className="mb-1 block text-sm text-[#a1a1a1]">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
              placeholder="+7 (999) 123-45-67"
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
            <label className="mb-1 block text-sm text-[#a1a1a1]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#a1a1a1]">Attachments</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              className="w-full rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#22c55e] file:text-white file:cursor-pointer"
            />
            {uploading && <p className="text-sm text-[#a1a1a1] mt-1">Uploading...</p>}
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att) => (
                <div key={att.id} className="relative group">
                  {isImage(att.fileType) ? (
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-16 h-16 rounded overflow-hidden border border-[#2a2a2a]"
                    >
                      <img src={att.fileUrl} alt={att.fileName} className="w-full h-full object-cover" />
                    </a>
                  ) : (
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    className="flex items-center justify-center w-16 h-16 rounded border border-[#2a2a2a] text-xs text-[#a1a1a1] bg-[#252525]"
                  >
                    {att.fileName?.substring(0, 10) || 'file'}...
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteAttachment(att.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

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