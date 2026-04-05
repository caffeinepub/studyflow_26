import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import type { PYQSubjectData, Subject } from "../types/studyflow";
import {
  getExamConfig,
  getTodayPYQ,
  saveTodayPYQ,
  todayStr,
  upsertDailyRecord,
} from "../utils/storage";

const SUBJECTS: { id: Subject; label: string }[] = [
  { id: "physics", label: "Physics" },
  { id: "chemistry", label: "Chemistry" },
  { id: "maths", label: "Maths" },
];

function formatSpeed(data: PYQSubjectData): string {
  if (data.studyMinutes < 1) return "--";
  const qph = Math.round((data.completed / data.studyMinutes) * 60);
  return `${qph} Q/hr`;
}

function accuracy(data: PYQSubjectData): string {
  const total = data.correct + data.wrong;
  if (total === 0) return "--";
  return `${Math.round((data.correct / total) * 100)}%`;
}

export default function PYQ() {
  const [dayData, setDayData] = useState(getTodayPYQ);
  const [expanded, setExpanded] = useState<Subject | null>(null);
  const exam = getExamConfig();

  const updateSubject = (s: Subject, patch: Partial<PYQSubjectData>) => {
    const updated = { ...dayData, [s]: { ...dayData[s], ...patch } };
    setDayData(updated);
    saveTodayPYQ(updated);
    const total =
      updated.physics.completed +
      updated.chemistry.completed +
      updated.maths.completed;
    upsertDailyRecord({
      date: todayStr(),
      totalPYQs: total,
      goalMet: total >= exam.dailyGoal,
      studySeconds: 0,
    });
  };

  const totalCompleted =
    dayData.physics.completed +
    dayData.chemistry.completed +
    dayData.maths.completed;
  const totalTarget =
    dayData.physics.target + dayData.chemistry.target + dayData.maths.target;

  return (
    <div className="px-4 pt-6 pb-28">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">PYQ Tracker</h1>
        <p className="text-[#666666] text-sm mt-0.5">
          {todayStr()} · {totalCompleted}/{totalTarget} total
        </p>
      </div>

      {SUBJECTS.map(({ id, label }) => {
        const data = dayData[id];
        const pct =
          data.target > 0
            ? Math.min(100, Math.round((data.completed / data.target) * 100))
            : 0;
        const isOpen = expanded === id;

        return (
          <GlassCard
            key={id}
            className="mb-3 cursor-pointer"
            onClick={() => setExpanded(isOpen ? null : id)}
            data-ocid={`pyq.${id}.card`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5">
                  <span className="text-sm font-bold text-[#333333]">
                    {label[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A]">{label}</p>
                  <p className="text-xs text-[#666666]">
                    {data.completed}/{data.target}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-lg font-bold text-[#111111]">{pct}%</p>
                </div>
                <span className="text-[#888888] text-lg">
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-white/40 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-[#222222]"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Expanded */}
            {isOpen && (
              <div
                className="mt-4 space-y-3"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="presentation"
              >
                {/* Target */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#666666]">Daily Target</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSubject(id, {
                          target: Math.max(0, data.target - 5),
                        })
                      }
                      className="w-7 h-7 rounded-full bg-white/60 text-[#666666] text-sm font-bold hover:bg-white/80 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-[#0A0A0A] w-8 text-center">
                      {data.target}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateSubject(id, { target: data.target + 5 })
                      }
                      className="w-7 h-7 rounded-full bg-white/60 text-[#666666] text-sm font-bold hover:bg-white/80 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Completed */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#666666]">Completed</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSubject(id, {
                          completed: Math.max(0, data.completed - 1),
                        })
                      }
                      className="w-7 h-7 rounded-full bg-white/60 text-[#666666] text-sm font-bold hover:bg-white/80 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-[#0A0A0A] w-8 text-center">
                      {data.completed}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateSubject(id, { completed: data.completed + 1 })
                      }
                      className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center text-sm font-bold text-white transition-colors"
                      data-ocid={`pyq.${id}.submit_button`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Correct / Wrong */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-[#666666] mb-1">Correct ✓</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateSubject(id, {
                            correct: Math.max(0, data.correct - 1),
                          })
                        }
                        className="w-6 h-6 rounded-full bg-white/60 text-xs text-[#666666] font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-[#333333] w-7 text-center">
                        {data.correct}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSubject(id, { correct: data.correct + 1 })
                        }
                        className="w-6 h-6 rounded-full bg-black/8 text-xs text-[#333333] font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#666666] mb-1">Wrong ✗</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateSubject(id, {
                            wrong: Math.max(0, data.wrong - 1),
                          })
                        }
                        className="w-6 h-6 rounded-full bg-white/60 text-xs text-[#666666] font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-[#888888] w-7 text-center">
                        {data.wrong}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSubject(id, { wrong: data.wrong + 1 })
                        }
                        className="w-6 h-6 rounded-full bg-black/5 text-xs text-[#888888] font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Study time */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#666666]">Study Minutes</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSubject(id, {
                          studyMinutes: Math.max(0, data.studyMinutes - 5),
                        })
                      }
                      className="w-6 h-6 rounded-full bg-white/60 text-xs text-[#666666] font-bold"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-[#0A0A0A] w-8 text-center">
                      {data.studyMinutes}m
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateSubject(id, {
                          studyMinutes: data.studyMinutes + 5,
                        })
                      }
                      className="w-6 h-6 rounded-full bg-white/60 text-xs text-[#666666] font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-around pt-2 border-t border-white/40">
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#0A0A0A]">
                      {formatSpeed(data)}
                    </p>
                    <p className="text-[10px] text-[#666666]">Speed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#0A0A0A]">
                      {accuracy(data)}
                    </p>
                    <p className="text-[10px] text-[#666666]">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#0A0A0A]">{pct}%</p>
                    <p className="text-[10px] text-[#666666]">Done</p>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        );
      })}

      {/* Totals */}
      <GlassCard strong className="mt-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#0A0A0A]">Total Today</p>
          <p className="text-xl font-bold text-[#111111]">
            {totalCompleted}{" "}
            <span className="text-sm text-[#666666]">
              / {exam.dailyGoal} goal
            </span>
          </p>
        </div>
        <div className="mt-2 h-1.5 bg-white/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#222222] rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, exam.dailyGoal > 0 ? Math.round((totalCompleted / exam.dailyGoal) * 100) : 0)}%`,
            }}
          />
        </div>
      </GlassCard>
    </div>
  );
}
