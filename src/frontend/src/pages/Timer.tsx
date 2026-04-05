import React, { useState, useEffect, useRef } from "react";
import GlassCard from "../components/GlassCard";
import type { StudySession } from "../types/studyflow";
import {
  getDailyRecords,
  getSessions,
  getTodayStudySeconds,
  getWeeklyStudySeconds,
  saveSessions,
  todayStr,
  upsertDailyRecord,
} from "../utils/storage";

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function formatReadable(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function TimerPage() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>(getSessions);
  const [showHistory, setShowHistory] = useState(false);

  const todaySeconds = sessions
    .filter((s) => s.date === todayStr())
    .reduce((a, s) => a + s.durationSeconds, 0);
  const weeklySeconds = getWeeklyStudySeconds();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const toggle = () => setRunning((r) => !r);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  const logSession = () => {
    if (elapsed < 60) return;
    const session: StudySession = {
      id: `sess-${Date.now()}`,
      date: todayStr(),
      durationSeconds: elapsed,
      notes: "",
    };
    const updated = [...sessions, session];
    setSessions(updated);
    saveSessions(updated);
    const total = getTodayStudySeconds() + elapsed;
    const records = getDailyRecords();
    const today = records.find((r) => r.date === todayStr());
    upsertDailyRecord({
      date: todayStr(),
      totalPYQs: today?.totalPYQs || 0,
      goalMet: today?.goalMet || false,
      studySeconds: total,
    });
    reset();
  };

  const recentSessions = sessions.slice(-10).reverse();

  return (
    <div className="px-4 pt-6 pb-28">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Study Timer</h1>
        <p className="text-[#666666] text-sm mt-0.5">
          Track your focus sessions
        </p>
      </div>

      {/* Main timer display */}
      <GlassCard strong className="mb-4 flex flex-col items-center py-8">
        <div
          className="text-6xl font-bold tracking-tighter mb-6"
          style={{
            color: running ? "#111111" : "#0A0A0A",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatDuration(elapsed)}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={toggle}
            data-ocid="timer.primary_button"
            className="px-8 py-3 rounded-2xl text-base font-bold text-white transition-all active:scale-95"
            style={{ background: running ? "#444444" : "#111111" }}
          >
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
          </button>
          <button
            type="button"
            onClick={reset}
            data-ocid="timer.secondary_button"
            className="px-5 py-3 rounded-2xl text-base font-bold text-[#666666] bg-white/60 transition-all active:scale-95"
          >
            Reset
          </button>
        </div>

        {elapsed >= 60 && !running && (
          <button
            type="button"
            onClick={logSession}
            data-ocid="timer.save_button"
            className="mt-3 px-6 py-2.5 rounded-2xl text-sm font-bold text-white bg-[#111111] transition-all active:scale-95"
          >
            ✓ Log Session ({formatReadable(elapsed)})
          </button>
        )}
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <GlassCard className="text-center">
          <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-1">
            TODAY
          </p>
          <p className="text-2xl font-bold text-[#111111]">
            {formatReadable(todaySeconds)}
          </p>
          <p className="text-[10px] text-[#AAAAAA]">study time</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-1">
            THIS WEEK
          </p>
          <p className="text-2xl font-bold text-[#333333]">
            {formatReadable(weeklySeconds)}
          </p>
          <p className="text-[10px] text-[#AAAAAA]">total hours</p>
        </GlassCard>
      </div>

      {/* Session history */}
      <GlassCard>
        <button
          type="button"
          className="w-full flex items-center justify-between"
          data-ocid="timer.panel"
          onClick={() => setShowHistory((h) => !h)}
        >
          <p className="text-sm font-bold text-[#0A0A0A]">Recent Sessions</p>
          <span className="text-[#888888]">{showHistory ? "▲" : "▼"}</span>
        </button>
        {showHistory && (
          <div className="mt-3 space-y-2">
            {recentSessions.length === 0 ? (
              <p
                className="text-xs text-[#AAAAAA] text-center py-4"
                data-ocid="timer.empty_state"
              >
                No sessions logged yet
              </p>
            ) : (
              recentSessions.map((s, idx) => (
                <div
                  key={s.id}
                  data-ocid={`timer.item.${idx + 1}`}
                  className="flex items-center justify-between py-1.5 border-b border-white/30 last:border-0"
                >
                  <p className="text-xs text-[#444444]">{s.date}</p>
                  <p className="text-xs font-bold text-[#333333]">
                    {formatReadable(s.durationSeconds)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
