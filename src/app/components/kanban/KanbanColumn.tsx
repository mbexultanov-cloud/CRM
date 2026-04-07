"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Stage, Deal } from "@/app/types";
import { DealCard } from "./DealCard";

interface KanbanColumnProps {
  stage: Stage;
  deals: Deal[];
  stages: Stage[];
  onMoveDeal: (dealId: number, direction: 'next' | 'prev') => void;
}

export function KanbanColumn({ stage, deals, stages, onMoveDeal }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex shrink-0 flex-col w-[300px]">
      <div
        className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2"
        style={{ backgroundColor: `${stage.color}20` }}
      >
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: stage.color }}
        />
        <h2 className="font-semibold text-white">{stage.name}</h2>
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
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} stages={stages} onMoveDeal={onMoveDeal} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="flex h-[100px] items-center justify-center text-[#555] text-sm">
            No deals
          </div>
        )}
      </div>
    </div>
  );
}
