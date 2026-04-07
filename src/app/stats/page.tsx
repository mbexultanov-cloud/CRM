import { getStages, getDeals } from "@/app/actions";
import Link from "next/link";
import { db } from "@/db";
import { deals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function StatsPage() {
  const stagesData = await getStages();
  const dealsData = await getDeals();

  const totalDeals = dealsData.length;
  const totalAmount = dealsData.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const wonDeals = dealsData.filter(d => {
    const stage = stagesData.find(s => s.id === d.stageId);
    return stage?.name === "Won";
  });
  const wonAmount = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  const lostDeals = dealsData.filter(d => {
    const stage = stagesData.find(s => s.id === d.stageId);
    return stage?.name === "Lost";
  });
  const lostAmount = lostDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

  const dealsByStage = stagesData.map(stage => ({
    name: stage.name,
    color: stage.color,
    count: dealsData.filter(d => d.stageId === stage.id).length,
    amount: dealsData
      .filter(d => d.stageId === stage.id)
      .reduce((sum, d) => sum + (d.amount || 0), 0),
  }));

  const conversionRate = totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0;

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
