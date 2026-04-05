import { Toaster } from "@/components/ui/sonner";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import BottomTabBar, { type Tab } from "./components/BottomTabBar";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Chapters from "./pages/Chapters";
import Dashboard from "./pages/Dashboard";
import Mistakes from "./pages/Mistakes";
import PYQ from "./pages/PYQ";
import Settings from "./pages/Settings";
import TimerPage from "./pages/Timer";
import { getExamConfig, getStreaks, getTodayPYQ } from "./utils/storage";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");

  // Smart notifications on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const streaks = getStreaks();
      const exam = getExamConfig();
      const todayPYQ = getTodayPYQ();
      const total =
        todayPYQ.physics.completed +
        todayPYQ.chemistry.completed +
        todayPYQ.maths.completed;

      if (streaks.current >= 5) {
        toast.success(
          `🔥 You're on a ${streaks.current}-day streak! Keep it up!`,
        );
      } else if (streaks.current === 0 && total < exam.dailyGoal) {
        toast(
          `📚 ${exam.dailyGoal - total} PYQs left to complete today's goal`,
        );
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const renderTab = () => {
    switch (tab) {
      case "dashboard":
        return <Dashboard />;
      case "pyq":
        return <PYQ />;
      case "chapters":
        return <Chapters />;
      case "mistakes":
        return <Mistakes />;
      case "timer":
        return <TimerPage />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-bg min-h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 16,
            color: "#0A0A0A",
          },
        }}
      />
      {/* Phone frame on desktop */}
      <div className="max-w-[430px] mx-auto relative min-h-screen">
        <div className="overflow-y-auto" style={{ minHeight: "100vh" }}>
          {renderTab()}
        </div>
        <BottomTabBar active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
