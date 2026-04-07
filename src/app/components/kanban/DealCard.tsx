"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Deal, Stage } from "@/app/types";

interface DealCardProps {
  deal: Deal;
  stages: Stage[];
  onMoveDeal: (dealId: number, direction: 'next' | 'prev') => void;
}

export function DealCard({ deal, stages, onMoveDeal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentStage = stages.find(s => s.id === deal.stageId);
  const currentIndex = stages.findIndex(s => s.id === deal.stageId);
  const canMovePrev = currentIndex > 0;
  const canMoveNext = currentIndex < stages.length - 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab rounded-lg bg-[#1a1a1a] p-4 border border-[#2a2a2a] shadow-md transition-all hover:border-[#3a3a3a] active:cursor-grabbing ${
        isDragging ? "opacity-80 rotate-2" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-white truncate flex-1">{deal.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          {canMovePrev && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDeal(deal.id, 'prev');
              }}
              className="p-1 rounded hover:bg-[#252525] transition-colors"
              title="Move to previous stage"
            >
              <svg className="w-3 h-3 text-[#a1a1a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {canMoveNext && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDeal(deal.id, 'next');
              }}
              className="p-1 rounded hover:bg-[#252525] transition-colors"
              title="Move to next stage"
            >
              <svg className="w-3 h-3 text-[#a1a1a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className="mb-2 text-sm text-[#a1a1a1]">{deal.clientName}</p>
      {deal.amount !== null && deal.amount !== undefined && (
        <p className="mb-2 font-semibold text-[#22c55e]">
          ${deal.amount.toLocaleString()}
        </p>
      )}
      {deal.description && (
        <p className="text-xs text-[#666] line-clamp-2">{deal.description}</p>
      )}
      <p className="mt-3 text-xs text-[#555]">
        {deal.updatedAt
          ? new Date(deal.updatedAt).toLocaleDateString()
          : "No date"}
      </p>
    </div>
  );
}
