
import React, { useState, useEffect } from 'react';
import { AppMode, TrainingSession } from './types';
import PracticeMode from './components/PracticeMode';
import Dictionary from './components/Dictionary';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('HOME');
  const [history, setHistory] = useState<TrainingSession[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('semaphore_history');
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
    localStorage.setItem('semaphore_history', JSON.stringify(updated));
  };

  const getRank = () => {
    if (history.length === 0) return "Beginner";
    
    const recent = history.slice(0, 5);
    const avgAcc = recent.reduce((a, b) => a + b.accuracy, 0) / recent.length;
    const avgSpeed = recent.reduce((a, b) => a + b.speedMs, 0) / recent.length;

    if (avgAcc >= 95 && avgSpeed <= 400 && history.length > 20) return "AINSC Winner";
    if (avgAcc >= 90 && avgSpeed <= 700 && history.length > 10) return "PreNSC Winner";
    if (avgAcc >= 75) return "InterGroup Winner";
    return "Beginner Cadet";
  };

  const NavItem = ({ m, icon, label }: { m: AppMode, icon: string, label: string }) => (
    <button 
      onClick={() => setMode(m)}
      className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 px-5 py-3 rounded-2xl transition-all ${
        mode === m ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <i className={`fas ${icon} text-lg`}></i>
      <span className="text-xs md:text-sm font-bold uppercase tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setMode('HOME')}>
            <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <i className="fas fa-anchor text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">SEMAPHORE <span className="text-blue-600">PRO</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Practice Semaphore for NSC</p>
            </div>
          </div>

          <nav className="flex space-x-2 md:space-x-4">
            <NavItem m="HOME" icon="fa-chart-pie" label="Dashboard" />
            <NavItem m="PRACTICE" icon="fa-bullseye" label="Practice" />
            <NavItem m="DICTIONARY" icon="fa-book" label="Dictionary" />
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">VS</div>
              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                <i className="fas fa-medal text-[10px]"></i>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-400 uppercase">Current Rank</span>
               <span className="text-xs font-black text-blue-600">{getRank()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
        {mode === 'HOME' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                      <div className="relative z-10">
                         <h2 className="text-5xl font-black mb-6 leading-tight">Master Visual <br/>Naval Signaling</h2>
                         <p className="text-blue-100 text-lg max-w-md mb-10 leading-relaxed opacity-90">
                            The ultimate training ground for NCC Naval Wing cadets preparing for NSC competitions.
                         </p>
                         <div className="flex space-x-4">
                           <button 
                             onClick={() => setMode('PRACTICE')}
                             className="bg-white text-blue-900 px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95 flex items-center space-x-3"
                           >
                             <i className="fas fa-play"></i>
                             <span>Start Training</span>
                           </button>
                           <button 
                             onClick={() => setMode('DICTIONARY')}
                             className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-500/30 transition-all flex items-center space-x-3"
                           >
                             <i className="fas fa-search"></i>
                             <span>Signal Lexicon</span>
                           </button>
                         </div>
                      </div>
                      <div className="absolute right-[-5%] bottom-[-15%] opacity-10 transform -rotate-12 pointer-events-none scale-150">
                         <i className="fas fa-anchor text-[25rem]"></i>
                      </div>
                   </div>

                   <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-800">Mission Readiness</h3>
                        <div className="flex space-x-2">
                           <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy %</span>
                        </div>
                      </div>
                      <div className="h-[320px] w-full">
                         {history.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={[...history].reverse()}>
                               <defs>
                                 <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis hide dataKey="date" />
                               <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}%`} />
                               <Tooltip 
                                 contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                               />
                               <Area type="monotone" dataKey="accuracy" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorAcc)" />
                             </AreaChart>
                           </ResponsiveContainer>
                         ) : (
                           <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <i className="fas fa-chart-line text-3xl"></i>
                              </div>
                              <p className="font-medium">Complete your first drill to activate telemetry.</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16"></div>
                      <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center space-x-3">
                         <i className="fas fa-trophy text-amber-500"></i>
                         <span>Cadet Records</span>
                      </h3>
                      <div className="space-y-5">
                         <div className="group p-5 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-blue-200 transition-all">
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</span>
                               <span className="text-xs font-black text-blue-600">{getRank()}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-blue-600 transition-all duration-1000" 
                                 style={{ width: `${history.length > 0 ? (history.reduce((a, b) => a + b.accuracy, 0) / history.length) : 0}%` }}
                               ></div>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-green-50 rounded-[1.5rem] border border-green-100">
                               <span className="block text-[10px] font-black text-green-600 uppercase mb-1">Total Signals</span>
                               <span className="text-2xl font-black text-slate-800">{history.reduce((acc, s) => acc + s.phrase.length, 0)}</span>
                            </div>
                            <div className="p-5 bg-orange-50 rounded-[1.5rem] border border-orange-100">
                               <span className="block text-[10px] font-black text-orange-600 uppercase mb-1">Avg Delay</span>
                               <span className="text-2xl font-black text-slate-800">{history.length > 0 ? Math.round(history.reduce((a, b) => a + b.speedMs, 0) / history.length) : 0}ms</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                      <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center space-x-3">
                         <i className="fas fa-list-check text-indigo-500"></i>
                         <span>Service Logs</span>
                      </h3>
                      <div className="space-y-4 max-h-[460px] overflow-y-auto no-scrollbar pr-2">
                         {history.length > 0 ? history.map((session) => (
                           <div key={session.id} className="p-5 border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-all group cursor-default">
                              <div className="flex justify-between items-start mb-3">
                                 <span className={`text-[10px] font-black px-3 py-1 rounded-full ${session.accuracy > 85 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {session.accuracy}% ACC
                                 </span>
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(session.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs font-mono font-bold text-slate-600 line-clamp-2 uppercase leading-relaxed">{session.phrase}</p>
                           </div>
                         )) : (
                           <div className="text-center py-20 text-slate-400">
                              <i className="fas fa-inbox text-4xl mb-4 block opacity-20"></i>
                              <p className="text-sm font-medium">No logs recorded yet.</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {mode === 'PRACTICE' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <PracticeMode onSessionComplete={saveSession} />
          </div>
        )}

        {mode === 'DICTIONARY' && (
          <div className="animate-in slide-in-from-right duration-500">
            <Dictionary />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
           <div className="flex justify-center space-x-8 text-slate-400 text-2xl">
              <a href="https://github.com/Code-2-Create" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-all transform hover:scale-110">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/vinayaksen77?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-all transform hover:scale-110">
                <i className="fab fa-linkedin"></i>
              </a>
           </div>
           <div className="space-y-1">
             <p className="text-sm text-slate-500 font-bold">
                Made by Vinayak Sen, NCC NAVAL WING, 1 MP NAVAL UNIT BHOPAL
             </p>
             <p className="text-xs text-slate-400 font-medium">
               © 2025 Semaphore Pro • Excellence in Signal Training • Version 2.0
             </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
