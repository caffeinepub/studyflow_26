import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import ProgressRing from "../components/ProgressRing";
import {
  getExamConfig,
  getStreaks,
  getTodayPYQ,
  getTodayStudySeconds,
  todayStr,
} from "../utils/storage";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function Dashboard() {
  const [now, setNow] = useState(new Date());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const exam = getExamConfig();
  const todayPYQ = getTodayPYQ();
  const streaks = getStreaks();
  const todayStudySeconds = getTodayStudySeconds();

  const totalCompleted =
    todayPYQ.physics.completed +
    todayPYQ.chemistry.completed +
    todayPYQ.maths.completed;
  const _totalTarget =
    todayPYQ.physics.target + todayPYQ.chemistry.target + todayPYQ.maths.target;
  const totalCorrect =
    todayPYQ.physics.correct +
    todayPYQ.chemistry.correct +
    todayPYQ.maths.correct;
  const totalWrong =
    todayPYQ.physics.wrong + todayPYQ.chemistry.wrong + todayPYQ.maths.wrong;
  const accuracy =
    totalCorrect + totalWrong > 0
      ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
      : 0;
  const progress =
    exam.dailyGoal > 0
      ? Math.round((totalCompleted / exam.dailyGoal) * 100)
      : 0;
  const daysLeft = getDaysUntil(exam.examDate);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const secsStr = String(now.getSeconds()).padStart(2, "0");
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const toggle = (card: string) =>
    setExpandedCard((prev) => (prev === card ? null : card));

  const subjects = [
    { key: "physics" as const, label: "Physics" },
    { key: "chemistry" as const, label: "Chem" },
    { key: "maths" as const, label: "Maths" },
  ];

  return (
    <div className="px-4 pt-6 pb-28">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] leading-tight">
          {getGreeting()} 👋
        </h1>
        <p className="text-[#666666] text-sm mt-0.5">{dateStr}</p>
      </div>

      {/* 3-column widgets */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Time Card */}
        <GlassCard
          className="cursor-pointer active:scale-95 transition-transform"
          onClick={() => toggle("time")}
          data-ocid="dashboard.time.card"
        >
          <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-1">
            CLOCK
          </p>
          <p className="text-xl font-bold text-[#0A0A0A] leading-none">
            {timeStr}
          </p>
          <p className="text-[#444444] font-bold text-sm mt-0.5">.{secsStr}</p>
          {expandedCard === "time" && (
            <div className="mt-2 pt-2 border-t border-white/40">
              <p className="text-[10px] text-[#666666]">Study today</p>
              <p className="text-sm font-bold text-[#0A0A0A]">
                {formatTime(todayStudySeconds)}
              </p>
            </div>
          )}
        </GlassCard>

        {/* Progress Ring Card */}
        <GlassCard
          strong
          className="cursor-pointer active:scale-95 transition-transform flex flex-col items-center col-span-1"
          onClick={() => toggle("progress")}
          data-ocid="dashboard.progress.card"
        >
          <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-2">
            DAILY PYQ
          </p>
          <ProgressRing
            radius={36}
            strokeWidth={6}
            progress={progress}
            color="#222222"
            trackColor="rgba(0,0,0,0.08)"
          >
            <span className="text-xs font-bold text-[#0A0A0A]">
              {progress}%
            </span>
          </ProgressRing>
          <p className="text-[11px] text-[#666666] mt-1.5">
            {totalCompleted}/{exam.dailyGoal}
          </p>
          {expandedCard === "progress" && (
            <div className="mt-2 pt-2 border-t border-white/40 w-full">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#333333] font-semibold">
                  ✓ {totalCorrect}
                </span>
                <span className="text-[#888888] font-semibold">
                  ✗ {totalWrong}
                </span>
              </div>
              <p className="text-[10px] text-[#666666] mt-1">
                Accuracy: {accuracy}%
              </p>
            </div>
          )}
        </GlassCard>

        {/* Exam Countdown */}
        <GlassCard
          className="cursor-pointer active:scale-95 transition-transform"
          onClick={() => toggle("exam")}
          data-ocid="dashboard.exam.card"
        >
          <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-1">
            EXAM
          </p>
          <p className="text-2xl font-bold text-[#111111] leading-none">
            {daysLeft}
          </p>
          <p className="text-[10px] text-[#666666] mt-0.5">days left</p>
          {expandedCard === "exam" && (
            <div className="mt-2 pt-2 border-t border-white/40">
              <p className="text-[10px] font-bold text-[#0A0A0A]">
                {exam.examName}
              </p>
              <p className="text-[9px] text-[#666666] mt-0.5">
                {exam.examDate}
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Streak Card */}
      <GlassCard
        className="cursor-pointer active:scale-95 transition-transform mb-3"
        onClick={() => toggle("streak")}
        data-ocid="dashboard.streak.card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider">
                STREAK
              </p>
              <p className="text-xl font-bold text-[#0A0A0A]">
                {streaks.current} days
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#666666]">Best</p>
            <p className="text-lg font-bold text-[#111111]">{streaks.best}</p>
          </div>
        </div>
        {expandedCard === "streak" && (
          <div className="mt-3 pt-3 border-t border-white/40 grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs font-bold text-[#0A0A0A]">
                {totalCompleted}
              </p>
              <p className="text-[10px] text-[#666666]">Today's PYQs</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-[#0A0A0A]">{accuracy}%</p>
              <p className="text-[10px] text-[#666666]">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-[#0A0A0A]">
                {formatTime(todayStudySeconds)}
              </p>
              <p className="text-[10px] text-[#666666]">Study time</p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Today Summary */}
      <GlassCard
        onClick={() => toggle("summary")}
        className="cursor-pointer active:scale-95 transition-transform"
        data-ocid="dashboard.summary.card"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-0.5">
              TODAY
            </p>
            <p className="text-3xl font-bold text-[#0A0A0A]">
              {totalCompleted}
            </p>
            <p className="text-xs text-[#666666]">questions solved</p>
          </div>
          <div className="text-right">
            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
              <span className="text-lg font-bold text-[#111111]">
                {Math.min(progress, 100)}%
              </span>
            </div>
          </div>
        </div>
        {expandedCard === "summary" && (
          <div className="mt-3 pt-3 border-t border-white/40">
            <div className="grid grid-cols-3 gap-2">
              {(["physics", "chemistry", "maths"] as const).map((s) => (
                <div key={s} className="text-center">
                  <p className="text-xs font-bold text-[#0A0A0A]">
                    {todayPYQ[s].completed}
                  </p>
                  <p className="text-[10px] text-[#666666] capitalize">
                    {s === "chemistry"
                      ? "Chem"
                      : s === "physics"
                        ? "Phys"
                        : "Math"}
                  </p>
                </div>
              ))}
            </div>
            {streaks.current >= 5 && (
              <div className="mt-2 text-center">
                <span className="text-[11px] font-semibold text-[#333333]">
                  🔥 You're on a {streaks.current}-day streak!
                </span>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Subject breakdown */}
      <div className="mt-3 px-1" data-ocid="dashboard.subjects.section">
        <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Subjects Today
        </p>
        <div className="flex flex-col gap-2">
          {subjects.map(({ key, label }) => {
            const completed = todayPYQ[key].completed;
            const target = todayPYQ[key].target;
            const pct =
              target > 0
                ? Math.min(100, Math.round((completed / target) * 100))
                : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#444444] font-medium">{label}</span>
                  <span className="text-[#666666]">
                    {completed}
                    <span className="text-[#999999]">/{target}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-white/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#222222] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
