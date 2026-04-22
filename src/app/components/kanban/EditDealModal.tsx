"use client";

import { useState, useEffect, useRef } from "react";
import { Deal, Stage, Attachment, User } from "@/app/types";
import { updateDeal, deleteDeal, getAttachments, deleteAttachment } from "@/app/actions";
import { WhatsAppChat } from "@/app/components/whatsapp/WhatsAppChat";

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
  const [dueDate, setDueDate] = useState(deal.dueDate ? new Date(deal.dueDate).toISOString().split('T')[0] : "");
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
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
        dueDate: dueDate ? new Date(dueDate) : null,
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
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-[#1a1a1a] p-6 border border-[#2a2a2a]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Edit Deal</h2>
          <button
            type="button"
            onClick={() => setShowWhatsApp(true)}
            title="Открыть WhatsApp чат"
            className="flex items-center gap-2 rounded-lg bg-[#25d366]/10 border border-[#25d366]/30 px-3 py-1.5 text-[#25d366] hover:bg-[#25d366]/20 transition-colors text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
        </div>
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

    {showWhatsApp && (
      <WhatsAppChat deal={deal} onClose={() => setShowWhatsApp(false)} />
    )}
    </>
  );
}