"use client";

import { useState } from "react";
import { Deal, Stage, User } from "@/app/types";

interface CalendarViewProps {
  deals: Deal[];
  stages: Stage[];
  users: User[];
  onEditDeal: (deal: Deal) => void;
}

export function CalendarView({ deals, stages, users, onEditDeal }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState<number | "all">("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getStageColor = (stageId: number) => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.color || "#666";
  };

  const getUserName = (userId: number | null) => {
    if (!userId) return null;
    const user = users.find(u => u.id === userId);
    return user?.name;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredDeals = deals.filter(deal => {
    if (selectedUser === "all") return true;
    return deal.userId === selectedUser;
  });

  const getDealsForDay = (day: number) => {
    const date = new Date(year, month, day);
    return filteredDeals.filter(deal => {
      const dealDate = deal.dueDate ? new Date(deal.dueDate as unknown as string) : new Date(deal.createdAt as unknown as string);
      return dealDate.getFullYear() === date.getFullYear() &&
             dealDate.getMonth() === date.getMonth() &&
             dealDate.getDate() === date.getDate();
    });
  };

  const today = new Date();
  const isToday = (day: number) => 
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-[#151515]" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDeals = getDealsForDay(day);
    days.push(
      <div key={day} className={`h-24 bg-[#1a1a1a] border border-[#2a2a2a] p-1 overflow-y-auto ${isToday(day) ? 'ring-2 ring-[#22c55e]' : ''}`}>
        <div className="text-xs text-[#666] mb-1">{day}</div>
        {dayDeals.map(deal => (
          <div
            key={deal.id}
            onClick={() => onEditDeal(deal)}
            className="text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-80"
            style={{ backgroundColor: getStageColor(deal.stageId) + "30", borderLeft: `3px solid ${getStageColor(deal.stageId)}` }}
          >
            <div className="text-white truncate">{deal.title}</div>
            {deal.userId && (
              <div className="text-[#8b5cf6] text-[10px]">{getUserName(deal.userId)}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#252525]">
            &lt;
          </button>
          <h3 className="text-xl font-semibold text-white">
            {monthNames[month]} {year}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#252525]">
            &gt;
          </button>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value === "all" ? "all" : parseInt(e.target.value))}
            className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-white text-sm"
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm bg-[#6366f1] text-white rounded hover:bg-[#4f46e5]"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#2a2a2a]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="bg-[#252525] p-2 text-center text-sm font-medium text-[#a1a1a1]">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}