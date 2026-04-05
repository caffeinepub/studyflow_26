import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import type { ExamConfig } from "../types/studyflow";
import { getExamConfig, setExamConfig } from "../utils/storage";

export default function Settings() {
  const [config, setConfig] = useState<ExamConfig>(getExamConfig);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const save = () => {
    setExamConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetAll = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="px-4 pt-6 pb-28">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Settings</h1>
        <p className="text-[#666666] text-sm">Customize your study tracker</p>
      </div>

      {/* Exam config */}
      <GlassCard strong className="mb-4">
        <p className="text-xs font-bold text-[#666666] uppercase tracking-wider mb-3">
          Exam
        </p>

        <div className="mb-3">
          <p className="text-xs text-[#666666] font-medium mb-1">Exam Name</p>
          <input
            id="examName"
            value={config.examName}
            data-ocid="settings.input"
            onChange={(e) =>
              setConfig((c) => ({ ...c, examName: e.target.value }))
            }
            className="w-full bg-white/60 rounded-xl px-3 py-2.5 text-sm text-[#0A0A0A] outline-none border border-white/40 font-medium"
          />
        </div>

        <div className="mb-3">
          <p className="text-xs text-[#666666] font-medium mb-1">Exam Date</p>
          <input
            id="examDate"
            type="date"
            value={config.examDate}
            data-ocid="settings.secondary_button"
            onChange={(e) =>
              setConfig((c) => ({ ...c, examDate: e.target.value }))
            }
            className="w-full bg-white/60 rounded-xl px-3 py-2.5 text-sm text-[#0A0A0A] outline-none border border-white/40"
          />
        </div>
      </GlassCard>

      {/* Goals */}
      <GlassCard className="mb-4">
        <p className="text-xs font-bold text-[#666666] uppercase tracking-wider mb-3">
          Goals
        </p>

        <div className="mb-3">
          <p className="text-xs text-[#666666] font-medium mb-1">
            Daily PYQ Goal
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  dailyGoal: Math.max(10, c.dailyGoal - 5),
                }))
              }
              className="w-9 h-9 rounded-full bg-white/60 text-[#666666] font-bold text-lg"
            >
              -
            </button>
            <span className="text-xl font-bold text-[#111111] flex-1 text-center">
              {config.dailyGoal}
            </span>
            <button
              type="button"
              onClick={() =>
                setConfig((c) => ({ ...c, dailyGoal: c.dailyGoal + 5 }))
              }
              data-ocid="settings.primary_button"
              className="w-9 h-9 rounded-full bg-black/5 text-[#444444] font-bold text-lg"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-[#666666] font-medium mb-1">
            Weekly PYQ Goal
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  weeklyGoal: Math.max(50, c.weeklyGoal - 25),
                }))
              }
              className="w-9 h-9 rounded-full bg-white/60 text-[#666666] font-bold text-lg"
            >
              -
            </button>
            <span className="text-xl font-bold text-[#333333] flex-1 text-center">
              {config.weeklyGoal}
            </span>
            <button
              type="button"
              onClick={() =>
                setConfig((c) => ({ ...c, weeklyGoal: c.weeklyGoal + 25 }))
              }
              className="w-9 h-9 rounded-full bg-black/5 text-[#444444] font-bold text-lg"
            >
              +
            </button>
          </div>
        </div>
      </GlassCard>

      <button
        type="button"
        onClick={save}
        data-ocid="settings.save_button"
        className="w-full py-3 rounded-2xl text-sm font-bold text-white mb-4 transition-all active:scale-95"
        style={{ background: saved ? "#333333" : "#111111" }}
      >
        {saved ? "✓ Saved!" : "Save Settings"}
      </button>

      {/* Danger zone */}
      <GlassCard>
        <p className="text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">
          Danger Zone
        </p>
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            data-ocid="settings.delete_button"
            className="text-xs text-[#444444] hover:underline"
          >
            Reset all data
          </button>
        ) : (
          <div data-ocid="settings.dialog">
            <p className="text-xs text-[#444444] mb-2">
              Are you sure? This will delete everything.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetAll}
                data-ocid="settings.confirm_button"
                className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-[#222222]"
              >
                Yes, reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                data-ocid="settings.cancel_button"
                className="flex-1 py-1.5 rounded-xl text-xs font-bold text-[#666666] bg-white/60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
