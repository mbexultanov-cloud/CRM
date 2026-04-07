"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Deal } from "@/app/types";

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-lg bg-[#1a1a1a] p-4 border border-[#2a2a2a] shadow-md transition-all hover:border-[#3a3a3a] active:cursor-grabbing ${
        isDragging ? "opacity-80 rotate-2" : ""
      }`}
    >
      <h3 className="mb-2 font-medium text-white truncate">{deal.title}</h3>
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
