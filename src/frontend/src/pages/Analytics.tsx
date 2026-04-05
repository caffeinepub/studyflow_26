import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import GlassCard from "../components/GlassCard";
import {
  getDailyRecords,
  getLast14DaysPYQ,
  getPYQDays,
  getSessions,
  subjectTotals,
} from "../utils/storage";

export default function Analytics() {
  const last14 = getLast14DaysPYQ();
  const totals = subjectTotals();
  const allSessions = getSessions();
  const allRecords = getDailyRecords();
  const allPYQDays = getPYQDays();

  const totalPYQsAllTime = allPYQDays.reduce(
    (a, d) =>
      a + d.physics.completed + d.chemistry.completed + d.maths.completed,
    0,
  );
  const totalStudyHours =
    Math.round(
      (allSessions.reduce((a, s) => a + s.durationSeconds, 0) / 3600) * 10,
    ) / 10;
  const avgDaily =
    allRecords.length > 0
      ? Math.round(
          allRecords.reduce((a, r) => a + r.totalPYQs, 0) / allRecords.length,
        )
      : 0;
  const bestDay = allRecords.reduce(
    (best, r) => (r.totalPYQs > best ? r.totalPYQs : best),
    0,
  );

  const barData = last14.map((d) => ({
    date: d.date.slice(5),
    PYQs: d.total,
  }));

  const lineData = last14.map((d) => ({
    date: d.date.slice(5),
    Accuracy: d.accuracy,
  }));

  const subjectData = [
    {
      subject: "Physics",
      value: totals.physics,
      color: "#111111",
      barColor: "#333333",
    },
    {
      subject: "Chemistry",
      value: totals.chemistry,
      color: "#444444",
      barColor: "#666666",
    },
    {
      subject: "Maths",
      value: totals.maths,
      color: "#777777",
      barColor: "#999999",
    },
  ];

  return (
    <div className="px-4 pt-6 pb-28">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Analytics</h1>
        <p className="text-[#666666] text-sm">Your performance at a glance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-[#111111]">
            {totalPYQsAllTime}
          </p>
          <p className="text-[10px] text-[#666666] mt-0.5">Total PYQs</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-[#333333]">
            {totalStudyHours}h
          </p>
          <p className="text-[10px] text-[#666666] mt-0.5">Study Hours</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-[#111111]">{avgDaily}</p>
          <p className="text-[10px] text-[#666666] mt-0.5">Avg Daily</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-2xl font-bold text-[#333333]">{bestDay}</p>
          <p className="text-[10px] text-[#666666] mt-0.5">Best Day</p>
        </GlassCard>
      </div>

      {/* PYQs per day bar chart */}
      <GlassCard className="mb-4">
        <p className="text-xs font-bold text-[#0A0A0A] mb-3">
          PYQs Per Day (14 days)
        </p>
        {totalPYQsAllTime === 0 ? (
          <p className="text-xs text-[#AAAAAA] text-center py-6">
            Start solving to see your chart
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={barData}
              margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "#AAAAAA" }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#AAAAAA" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "#0A0A0A",
                }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="PYQs" fill="#222222" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </GlassCard>

      {/* Accuracy trend */}
      <GlassCard className="mb-4">
        <p className="text-xs font-bold text-[#0A0A0A] mb-3">
          Accuracy Trend (%)
        </p>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart
            data={lineData}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#AAAAAA" }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#AAAAAA" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 8,
                fontSize: 11,
                color: "#0A0A0A",
              }}
            />
            <Line
              type="monotone"
              dataKey="Accuracy"
              stroke="#555555"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Subject-wise */}
      <GlassCard>
        <p className="text-xs font-bold text-[#0A0A0A] mb-3">
          Subject Breakdown
        </p>
        {totalPYQsAllTime === 0 ? (
          <p className="text-xs text-[#AAAAAA] text-center py-4">No data yet</p>
        ) : (
          <div className="space-y-2">
            {subjectData.map(({ subject, value, color, barColor }) => {
              const total = totals.physics + totals.chemistry + totals.maths;
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={subject}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#444444] font-medium">
                      {subject}
                    </span>
                    <span className="font-bold" style={{ color }}>
                      {value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
