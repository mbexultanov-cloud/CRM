"use client";

import { useState, useEffect } from "react";
import { Stage, Deal } from "@/app/types";
import { getStages, getDeals } from "@/app/actions";
import { KanbanBoard } from "./components/kanban/KanbanBoard";
import { NewDealModal } from "./components/kanban/NewDealModal";

export default function Home() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [refreshKey]);

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
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
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-[#22c55e] px-4 py-2 font-medium text-white hover:bg-[#16a34a]"
          >
            + New Deal
          </button>
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
          <KanbanBoard stages={stages} deals={deals} />
        )}
      </div>

      {showModal && (
        <NewDealModal
          stages={stages}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </main>
  );
}
