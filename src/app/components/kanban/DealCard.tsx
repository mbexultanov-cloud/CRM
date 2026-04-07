"use client";

import { useDraggable } from "@dnd-kit/core";
import { Deal, Stage } from "@/app/types";

interface DealCardProps {
  deal: Deal;
  stages: Stage[];
  onMoveDeal: (dealId: number, direction: 'next' | 'prev') => void;
  onEdit: (deal: Deal) => void;
}

export function DealCard({ deal, stages, onMoveDeal, onEdit }: DealCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
  });

  const currentIndex = stages.findIndex(s => s.id === deal.stageId);
  const canMovePrev = currentIndex > 0;
  const canMoveNext = currentIndex < stages.length - 1;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onDoubleClick={() => onEdit(deal)}
      className={`cursor-grab rounded-lg bg-[#1a1a1a] p-4 border border-[#2a2a2a] shadow-md transition-all hover:border-[#3a3a3a] active:cursor-grabbing group ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-white truncate flex-1">{deal.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(deal);
            }}
            className="p-1 rounded hover:bg-[#252525] transition-colors"
            title="Edit deal"
          >
            <svg className="w-3 h-3 text-[#a1a1a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
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
      {deal.phone && (
        <p className="mb-2 text-sm text-[#6366f1]">{deal.phone}</p>
      )}
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
