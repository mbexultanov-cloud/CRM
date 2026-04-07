"use client";

import { useState, useEffect } from "react";
import { Stage, Deal } from "@/app/types";
import { getStages, getDeals } from "@/app/actions";
import { KanbanBoard } from "./components/kanban/KanbanBoard";
import { NewDealModal } from "./components/kanban/NewDealModal";
import { EditDealModal } from "./components/kanban/EditDealModal";

export default function Home() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const [stagesData, dealsData] = await Promise.all([
        getStages(),
        getDeals(),
      ]);
      setStages(stagesData);
      setDeals(dealsData);
      setLoading(false);
    }
    load();
  }, []);

  const filteredDeals = deals.filter((deal) => {
    if (timeFilter === "all") return true;
    
    const dealDate = deal.createdAt ? new Date(deal.createdAt) : null;
    if (!dealDate) return true;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeFilter) {
      case "today":
        return dealDate >= today;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return dealDate >= weekAgo;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return dealDate >= monthAgo;
      case "year":
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return dealDate >= yearAgo;
      default:
        return true;
    }
  });

  const refreshData = async () => {
    const [stagesData, dealsData] = await Promise.all([
      getStages(),
      getDeals(),
    ]);
    setStages(stagesData);
    setDeals(dealsData);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-[#a1a1a1]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <header className="border-b border-[#2a2a2a] bg-[#0f0f0f] sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e]">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">CRM Kanban</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-white text-sm"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
            <a
              href="/stats"
              className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-[#a1a1a1] hover:text-white hover:border-[#3a3a3a]"
            >
              Stats
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-[#22c55e] px-4 py-2 font-medium text-white hover:bg-[#16a34a]"
            >
              + New Deal
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {stages.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-[#2a2a2a]">
            <div className="text-center">
              <p className="mb-2 text-[#a1a1a1]">No stages configured</p>
              <p className="text-sm text-[#666]">
                Set up your sales pipeline stages
              </p>
            </div>
          </div>
        ) : (
          <KanbanBoard 
            stages={stages} 
            deals={filteredDeals} 
            onEditDeal={setEditingDeal}
          />
        )}
      </div>

      {showModal && (
        <NewDealModal
          stages={stages}
          onClose={() => setShowModal(false)}
          onSuccess={refreshData}
        />
      )}

      {editingDeal && (
        <EditDealModal
          deal={editingDeal}
          stages={stages}
          onClose={() => setEditingDeal(null)}
          onSuccess={refreshData}
        />
      )}
    </main>
  );
}
