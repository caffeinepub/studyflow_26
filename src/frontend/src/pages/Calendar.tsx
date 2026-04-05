import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import type { DailyRecord } from "../types/studyflow";
import {
  getDailyRecords,
  getExamConfig,
  getMonthCalendar,
  getStreaks,
} from "../utils/storage";

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendar = getMonthCalendar(year, month);
  const records = getDailyRecords();
  const streaks = getStreaks();
  const exam = getExamConfig();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const completedDays = calendar.filter((d) => d.state === "complete").length;
  const totalDays = calendar.filter(
    (d) => d.state !== "none" || new Date(d.date) <= now,
  ).length;
  const completionPct =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const getRecord = (date: string): DailyRecord | undefined =>
    records.find((r) => r.date === date);

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const stateColor = (state: "complete" | "missed" | "none") => {
    if (state === "complete")
      return {
        bg: "rgba(0,0,0,0.08)",
        text: "#111111",
        border: "rgba(0,0,0,0.15)",
      };
    if (state === "missed")
      return {
        bg: "rgba(0,0,0,0.03)",
        text: "#888888",
        border: "rgba(0,0,0,0.08)",
      };
    return { bg: "transparent", text: "#666666", border: "transparent" };
  };

  return (
    <div className="px-4 pt-6 pb-28">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Calendar</h1>
        <p className="text-[#666666] text-sm">Consistency tracker</p>
      </div>

      {/* Streak + stats */}
      <GlassCard className="mb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-[#0A0A0A]">
              🔥 {streaks.current}
            </p>
            <p className="text-[10px] text-[#666666]">Streak</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#111111]">{streaks.best}</p>
            <p className="text-[10px] text-[#666666]">Best streak</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#111111]">{completionPct}%</p>
            <p className="text-[10px] text-[#666666]">This month</p>
          </div>
        </div>
      </GlassCard>

      {/* Month navigation */}
      <GlassCard className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            data-ocid="calendar.pagination_prev"
            className="w-8 h-8 rounded-full bg-white/60 text-[#666666] font-bold"
          >
            &lt;
          </button>
          <p className="text-sm font-bold text-[#0A0A0A]">{monthName}</p>
          <button
            type="button"
            onClick={nextMonth}
            data-ocid="calendar.pagination_next"
            className="w-8 h-8 rounded-full bg-white/60 text-[#666666] font-bold"
          >
            &gt;
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold text-[#AAAAAA] py-0.5"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {[..." ".repeat(firstDayOfWeek)].map((_, i) => (
            <div key={`pad-${i}-${month}-${year}`} aria-hidden="true" />
          ))}
          {calendar.map(({ date, state }) => {
            const day = Number.parseInt(date.slice(8), 10);
            const colors = stateColor(state);
            const isToday = date === new Date().toISOString().slice(0, 10);
            const isSelected = selectedDate === date;
            return (
              <button
                type="button"
                key={date}
                onClick={() =>
                  setSelectedDate((d) => (d === date ? null : date))
                }
                className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${
                  isSelected ? "ring-2 ring-[#222222]" : ""
                } ${isToday ? "font-extrabold" : ""}`}
                style={{
                  background: isSelected ? "rgba(0,0,0,0.06)" : colors.bg,
                  color: state === "none" ? "#444444" : colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3 justify-center">
          <span className="text-[9px] text-[#333333] font-semibold">
            ✓ Complete
          </span>
          <span className="text-[9px] text-[#888888] font-semibold">
            ✗ Missed
          </span>
          <span className="text-[9px] text-[#AAAAAA] font-semibold">
            ○ No activity
          </span>
        </div>
      </GlassCard>

      {/* Selected day detail */}
      {selectedDate &&
        (() => {
          const rec = getRecord(selectedDate);
          return (
            <GlassCard strong data-ocid="calendar.panel">
              <p className="text-sm font-bold text-[#0A0A0A] mb-2">
                {selectedDate}
              </p>
              {rec ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-lg font-bold text-[#111111]">
                      {rec.totalPYQs}
                    </p>
                    <p className="text-[10px] text-[#666666]">PYQs solved</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#111111]">
                      {formatTime(rec.studySeconds)}
                    </p>
                    <p className="text-[10px] text-[#666666]">Study time</p>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        rec.goalMet
                          ? "bg-black/5 text-[#333333]"
                          : "bg-black/3 text-[#888888]"
                      }`}
                    >
                      {rec.goalMet ? "✓ Goal met" : "✗ Goal missed"} (goal:{" "}
                      {exam.dailyGoal})
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#AAAAAA]">
                  No activity recorded for this day.
                </p>
              )}
            </GlassCard>
          );
        })()}
    </div>
  );
}
