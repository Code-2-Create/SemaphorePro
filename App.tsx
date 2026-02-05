import React, { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AppMode, TrainingSession } from "./types";
import PracticeMode from "./components/PracticeMode";
import Dictionary from "./components/Dictionary";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>("HOME");
  const [history, setHistory] = useState<TrainingSession[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("semaphore_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading history");
      }
    }
  }, []);

  const saveSession = (session: TrainingSession) => {
    const updated = [session, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("semaphore_history", JSON.stringify(updated));
  };

  const getRank = () => {
    if (history.length === 0) return "Beginner Cadet";

    const recent = history.slice(0, 5);
    const avgAcc = recent.reduce((a, b) => a + b.accuracy, 0) / recent.length;
    const avgSpeed = recent.reduce((a, b) => a + b.speedMs, 0) / recent.length;

    if (avgAcc >= 95 && avgSpeed <= 400 && history.length > 20)
      return "AINSC Champion";
    if (avgAcc >= 90 && avgSpeed <= 700 && history.length > 10)
      return "PreNSC Winner";
    if (avgAcc >= 75) return "InterGroup Winner";
    return "Beginner Cadet";
  };

  const getTotalTransmissions = () => history.length;

  const getAverageAccuracy = () => {
    if (history.length === 0) return 0;
    return Math.round(
      history.reduce((a, b) => a + b.accuracy, 0) / history.length
    );
  };

  const NavItem = ({
    m,
    icon,
    label,
    onClick,
  }: {
    m: AppMode;
    icon: string;
    label: string;
    onClick?: () => void;
  }) => (
    <button
      onClick={() => {
        setMode(m);
        if (onClick) onClick();
      }}
      className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all font-bold ${
        mode === m
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <i className={`fas ${icon} text-xl`}></i>
      <span className="text-sm uppercase tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-lg">
        <div className="px-4 py-3 flex justify-between items-center">
          <div
            className="group flex items-center space-x-3 cursor-pointer"
            onClick={() => setMode("HOME")}
          >
            {/* Replace /logo.png with your actual logo path */}
            <div className="relative transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-40"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-anchor text-white text-xl"></i>
              </div>
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                SEMAPHORE PRO
              </h1>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Naval Communication Training
              </p>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
          >
            <i
              className={`fas ${
                menuOpen ? "fa-times" : "fa-bars"
              } text-slate-700 text-xl`}
            ></i>
          </button>
        </div>
      </header>

      {/* Slide-out Menu */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">Menu</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
            >
              <i className="fas fa-times text-slate-600"></i>
            </button>
          </div>

          <nav className="space-y-3">
            <NavItem
              m="HOME"
              icon="fa-home"
              label="Home"
              onClick={() => setMenuOpen(false)}
            />
            <NavItem
              m="PRACTICE"
              icon="fa-bullseye"
              label="Practice"
              onClick={() => setMenuOpen(false)}
            />
            <NavItem
              m="DICTIONARY"
              icon="fa-book"
              label="Learn Symbols"
              onClick={() => setMenuOpen(false)}
            />
          </nav>

          <div className="pt-6 border-t border-slate-200">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border-2 border-blue-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                  <i className="fas fa-medal text-white text-sm"></i>
                </div>
                <div>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider">
                    Current Rank
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {getRank()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase">
                    Sessions
                  </p>
                  <p className="text-xl font-black text-blue-600">
                    {getTotalTransmissions()}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase">
                    Accuracy
                  </p>
                  <p className="text-xl font-black text-green-600">
                    {getAverageAccuracy()}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full p-4 pb-20 max-w-7xl mx-auto">
        {mode === "HOME" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Hero Card */}
            <div className="relative bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm px-3 py-2 rounded-full mb-4 border border-blue-400/30">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">
                    Semaphore Training Platform
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight flex items-center flex-wrap gap-3">
                  <span>Master Naval</span>
                  <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                    Semaphore Signaling
                  </span>
                </h2>

                <p className="text-blue-100 text-sm mb-6 leading-relaxed max-w-md">
                  The ultimate training ground for NCC Naval Wing cadets
                  preparing for AINSC. Real-time practice with precision
                  feedback.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setMode("PRACTICE")}
                    className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-play"></i>
                    <span>Start Training</span>
                  </button>
                  <button
                    onClick={() => setMode("DICTIONARY")}
                    className="bg-blue-500/20 backdrop-blur-md border-2 border-blue-400/30 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <i className="fas fa-book-open"></i>
                    <span>Learn Signals</span>
                  </button>
                </div>
              </div>

              <div className="absolute right-[-5%] bottom-[-15%] opacity-10 transform -rotate-12 pointer-events-none">
                <i className="fas fa-anchor text-[15rem]"></i>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                    <i className="fas fa-signal text-white text-sm"></i>
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Transmissions
                </p>
                <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {getTotalTransmissions()}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
                    <i className="fas fa-bullseye text-white text-sm"></i>
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                  Avg Accuracy
                </p>
                <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {getAverageAccuracy()}%
                </p>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <i className="fas fa-chart-line text-white text-xs"></i>
                  </div>
                  <span>Performance</span>
                </h3>
                <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[9px] font-black text-blue-600 uppercase">
                    Accuracy
                  </span>
                </div>
              </div>

              <div className="h-64">
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[...history].reverse().slice(-10)}>
                      <defs>
                        <linearGradient
                          id="colorAcc"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis hide />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#94a3b8"
                        fontSize={10}
                        tickFormatter={(val) => `${val}%`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          fontSize: "12px",
                          outline: "none",
                        }}
                        wrapperStyle={{ outline: "none" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="url(#colorAcc)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-3">
                      <i className="fas fa-chart-line text-2xl text-blue-400"></i>
                    </div>
                    <p className="font-bold text-sm text-slate-600 mb-2">
                      Start Your First Session
                    </p>
                    <button
                      onClick={() => setMode("PRACTICE")}
                      className="text-xs text-blue-600 font-bold flex items-center space-x-1"
                    >
                      <span>Begin Training</span>
                      <i className="fas fa-arrow-right text-[10px]"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-slate-200">
              <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <i className="fas fa-history text-white text-xs"></i>
                </div>
                <span>Recent Sessions</span>
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.length > 0 ? (
                  history.slice(0, 8).map((session, idx) => (
                    <div
                      key={session.id}
                      className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs font-black px-3 py-1 rounded-full ${
                              session.accuracy > 85
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                            }`}
                          >
                            {session.accuracy}%
                          </span>
                          {idx === 0 && (
                            <span className="text-[8px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-full uppercase">
                              Latest
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono font-bold text-slate-700 line-clamp-2 uppercase">
                        {session.phrase}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-inbox text-xl text-slate-300"></i>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mb-3">
                      No sessions yet
                    </p>
                    <button
                      onClick={() => setMode("PRACTICE")}
                      className="text-xs text-blue-600 font-bold"
                    >
                      Start Training →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === "PRACTICE" && (
          <div className="animate-in zoom-in duration-500">
            <PracticeMode onSessionComplete={saveSession} />
          </div>
        )}

        {mode === "DICTIONARY" && (
          <div className="animate-in slide-in-from-right duration-500">
            <Dictionary />
          </div>
        )}
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center space-x-6 text-slate-400 text-xl">
            <a
              href="https://github.com/Code-2-Create"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-all"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href="https://www.linkedin.com/in/vinayaksen77"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 transition-all"
            >
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-600 font-bold">
              Developed by Vinayak Sen, NCC NAVAL WING
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              1 MP Naval Unit Bhopal • Version 2.0
            </p>
          </div>
        </div>
      </footer>
      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;
