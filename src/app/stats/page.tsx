"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Stage, Deal } from "@/app/types";
import { getStages, getDeals } from "@/app/actions";

export default function StatsPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    async function load() {
      const [stagesData, dealsData] = await Promise.all([
        getStages(),
        getDeals(),
      ]);
      setStages(stagesData);
      setDeals(dealsData);
      
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      setDateTo(today.toISOString().split("T")[0]);
      setDateFrom(monthAgo.toISOString().split("T")[0]);
      
      setLoading(false);
    }
    load();
  }, []);

  const filteredDeals = deals.filter((deal) => {
    const dealDate = deal.createdAt ? new Date(deal.createdAt) : null;
    if (!dealDate) return true;
    
    let fromOk = true;
    let toOk = true;
    
    if (dateFrom) {
      fromOk = dealDate >= new Date(dateFrom);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);
      toOk = dealDate <= toDate;
    }
    
    return fromOk && toOk;
  });

  const totalDeals = filteredDeals.length;
  const totalAmount = filteredDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const wonDeals = filteredDeals.filter(d => {
    const stage = stages.find(s => s.id === d.stageId);
    return stage?.name === "Won";
  });
  const wonAmount = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const lostDeals = filteredDeals.filter(d => {
    const stage = stages.find(s => s.id === d.stageId);
    return stage?.name === "Lost";
  });
  const lostAmount = lostDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

  const dealsByStage = stages.map(stage => ({
    name: stage.name,
    color: stage.color,
    count: filteredDeals.filter(d => d.stageId === stage.id).length,
    amount: filteredDeals
      .filter(d => d.stageId === stage.id)
      .reduce((sum, d) => sum + (d.amount || 0), 0),
  }));

  const conversionRate = totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0;

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
        <div className="flex items-center gap-3 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-[#a1a1a1] hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="w-px h-6 bg-[#2a2a2a]" />
          <h1 className="text-xl font-bold text-white">Statistics</h1>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a] flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-[#a1a1a1] mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-[#a1a1a1] mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-md bg-[#252525] border border-[#2a2a2a] px-3 py-2 text-white"
            />
          </div>
          <div className="text-sm text-[#a1a1a1] pb-2">
            {filteredDeals.length} deals in selected period
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
            <p className="text-sm text-[#a1a1a1] mb-1">Total Deals</p>
            <p className="text-3xl font-bold text-white">{totalDeals}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
            <p className="text-sm text-[#a1a1a1] mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-[#22c55e]">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
            <p className="text-sm text-[#a1a1a1] mb-1">Won</p>
            <p className="text-3xl font-bold text-[#22c55e]">{wonDeals.length}</p>
            <p className="text-sm text-[#a1a1a1]">${wonAmount.toLocaleString()}</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
            <p className="text-sm text-[#a1a1a1] mb-1">Lost</p>
            <p className="text-3xl font-bold text-[#ef4444]">{lostDeals.length}</p>
            <p className="text-sm text-[#a1a1a1]">${lostAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <h2 className="text-lg font-semibold text-white mb-4">Conversion Rate</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 bg-[#252525] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22c55e] transition-all"
                style={{ width: `${conversionRate}%` }}
              />
            </div>
            <p className="text-2xl font-bold text-white">{conversionRate}%</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          <h2 className="text-lg font-semibold text-white mb-4">Deals by Stage</h2>
          <div className="space-y-3">
            {dealsByStage.map((stage) => (
              <div key={stage.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="w-32 text-white">{stage.name}</span>
                <div className="flex-1 h-2 bg-[#252525] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${totalDeals > 0 ? (stage.count / totalDeals) * 100 : 0}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
                <span className="w-16 text-right text-[#a1a1a1]">{stage.count}</span>
                <span className="w-24 text-right text-[#22c55e]">${stage.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
