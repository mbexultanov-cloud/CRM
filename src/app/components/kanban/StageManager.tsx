"use client";

import { useState } from "react";
import { Stage } from "@/app/types";
import { createStage, deleteStage } from "@/app/actions";

interface StageManagerProps {
  stages: Stage[];
  onUpdate: () => void;
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#f59e0b", "#f97316", "#22c55e", "#ef4444",
  "#06b6d4", "#ec4899", "#14b8a6", "#a855f7"
];

export function StageManager({ stages, onUpdate }: StageManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await createStage({ name: newName, color: newColor });
      setNewName("");
      setShowAdd(false);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this stage?")) return;
    setLoading(true);
    try {
      await deleteStage(id);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Manage Stages</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-sm text-[#22c55e] hover:underline"
        >
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2 p-3 bg-[#252525] rounded-lg">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Stage name"
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-white text-sm"
          />
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full ${newColor === c ? "ring-2 ring-white" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={loading || !newName.trim()}
            className="px-3 py-1 bg-[#22c55e] text-white rounded text-sm"
          >
            Add
          </button>
        </div>
      )}

      <div className="space-y-1">
        {stages.map((stage) => (
          <div key={stage.id} className="flex items-center gap-2 p-2 bg-[#252525] rounded">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="flex-1 text-white text-sm">{stage.name}</span>
            <button
              onClick={() => handleDelete(stage.id)}
              className="text-[#ef4444] hover:text-white text-xs"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
