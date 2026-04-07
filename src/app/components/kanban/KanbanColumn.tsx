"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Stage, Deal } from "@/app/types";
import { DealCard } from "./DealCard";

interface KanbanColumnProps {
  stage: Stage;
  deals: Deal[];
  stages: Stage[];
  onMoveDeal: (dealId: number, direction: 'next' | 'prev') => void;
  onUpdateStage: (id: number, data: { name?: string; color?: string }) => void;
  onEditDeal: (deal: Deal) => void;
}

export function KanbanColumn({ stage, deals, stages, onMoveDeal, onUpdateStage, onEditDeal }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);

  const handleSave = () => {
    if (editName.trim() && editName !== stage.name) {
      onUpdateStage(stage.id, { name: editName.trim() });
    } else {
      setEditName(stage.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditName(stage.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex shrink-0 flex-col w-[300px]">
      <div
        className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2"
        style={{ backgroundColor: `${stage.color}20` }}
      >
        <div
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: stage.color }}
        />
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-white font-semibold outline-none border-b border-[#3a3a3a]"
          />
        ) : (
          <h2
            onClick={() => setIsEditing(true)}
            className="font-semibold text-white cursor-text hover:opacity-80"
          >
            {stage.name}
          </h2>
        )}
        <span className="ml-auto rounded-full bg-[#252525] px-2 py-0.5 text-xs text-[#a1a1a1]">
          {deals.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 rounded-lg p-2 min-h-[200px] transition-colors ${
          isOver ? "bg-[#1a1a1a]/50 border-2 border-dashed border-[#3a3a3a]" : "bg-[#0f0f0f]"
        }`}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} stages={stages} onMoveDeal={onMoveDeal} onEdit={onEditDeal} />
        ))}
        {deals.length === 0 && (
          <div className="flex h-[100px] items-center justify-center text-[#555] text-sm">
            No deals
          </div>
        )}
      </div>
    </div>
  );
}