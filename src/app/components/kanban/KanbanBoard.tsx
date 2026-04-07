"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Stage, Deal } from "@/app/types";
import { KanbanColumn } from "./KanbanColumn";
import { DealCard } from "./DealCard";
import { updateDeal } from "@/app/actions";

interface KanbanBoardProps {
  stages: Stage[];
  deals: Deal[];
}

export function KanbanBoard({ stages, deals }: KanbanBoardProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [localDeals, setLocalDeals] = useState(deals);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const findStageByDealId = useCallback(
    (dealId: number) => {
      const deal = localDeals.find((d) => d.id === dealId);
      return deal ? stages.find((s) => s.id === deal.stageId) : null;
    },
    [localDeals, stages]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = localDeals.find((d) => d.id === event.active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    const activeDeal = localDeals.find((d) => d.id === activeId);
    if (!activeDeal) return;

    const overStage = stages.find((s) => s.id === overId);
    const overDeal = localDeals.find((d) => d.id === overId);

    if (overStage && activeDeal.stageId !== overStage.id) {
      setLocalDeals((items) =>
        items.map((item) =>
          item.id === activeId
            ? { ...item, stageId: overStage.id }
            : item
        )
      );
    } else if (overDeal) {
      const overDealStage = stages.find((s) => s.id === overDeal.stageId);
      if (overDealStage && activeDeal.stageId !== overDealStage.id) {
        setLocalDeals((items) =>
          items.map((item) =>
            item.id === activeId
              ? { ...item, stageId: overDealStage.id }
              : item
          )
        );
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    const activeDeal = localDeals.find((d) => d.id === activeId);
    if (!activeDeal) return;

    const overStage = stages.find((s) => s.id === overId);
    const overDeal = localDeals.find((d) => d.id === overId);

    let newStageId = activeDeal.stageId;

    if (overStage) {
      newStageId = overStage.id;
    } else if (overDeal) {
      newStageId = overDeal.stageId;
    }

    if (newStageId !== activeDeal.stageId) {
      try {
        await updateDeal(activeId, { stageId: newStageId });
        setLocalDeals((items) =>
          items.map((item) =>
            item.id === activeId ? { ...item, stageId: newStageId } : item
          )
        );
      } catch (error) {
        console.error("Failed to update deal:", error);
      }
    }
  };

  const handleMoveDeal = async (dealId: number, direction: 'next' | 'prev') => {
    const deal = localDeals.find(d => d.id === dealId);
    if (!deal) return;

    const currentIndex = stages.findIndex(s => s.id === deal.stageId);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0 || newIndex >= stages.length) return;

    const newStage = stages[newIndex];

    try {
      await updateDeal(dealId, { stageId: newStage.id });
      setLocalDeals(prev =>
        prev.map(d => d.id === dealId ? { ...d, stageId: newStage.id } : d)
      );
    } catch (error) {
      console.error("Failed to move deal:", error);
    }
  };

  const getDealsByStage = useCallback(
    (stageId: number) => {
      return localDeals.filter((d) => d.stageId === stageId);
    },
    [localDeals]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={getDealsByStage(stage.id)}
            stages={stages}
            onMoveDeal={handleMoveDeal}
          />
        ))}
      </div>
      <DragOverlay>
        {activeDeal ? <DealCard deal={activeDeal} stages={stages} onMoveDeal={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
