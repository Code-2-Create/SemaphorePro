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
    if (history.length === 0) return "Beginner Cadet";
    
    const recent = history.slice(0, 5);
    const avgAcc = recent.reduce((a, b) => a + b.accuracy, 0) / recent.length;
    const avgSpeed = recent.reduce((a, b) => a + b.speedMs, 0) / recent.length;

    if (avgAcc >= 95 && avgSpeed <= 400 && history.length > 20) return "AINSC Champion";
    if (avgAcc >= 90 && avgSpeed <= 700 && history.length > 10) return "PreNSC Winner";
    if (avgAcc >= 75) return "InterGroup Winner";
    return "Beginner Cadet";
  };

  const getTotalTransmissions = () => history.length;
  
  const getAverageAccuracy = () => {
    if (history.length === 0) return 0;
    return Math.round(history.reduce((a, b) => a + b.accuracy, 0) / history.length);
  };

  const NavItem = ({ m, icon, label }: { m: AppMode, icon: string, label: string }) => (
    <button 
      onClick={() => setMode(m)}
      className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 px-6 py-3 rounded-2xl transition-all font-bold ${
        mode === m 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
      }`}
    >
      <i className={`fas ${icon} text-lg`}></i>
      <span className="text-xs md:text-sm uppercase tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setMode('HOME')}>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                <i className="fas fa-anchor text-white text-2xl"></i>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                SEMAPHORE PRO
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                Naval Signal Training Platform
              </p>
            </div>
          </div>

          <nav className="flex space-x-2 md:space-x-3 bg-slate-100 p-2 rounded-2xl">
            <NavItem m="HOME" icon="fa-home" label="Home" />
            <NavItem m="PRACTICE" icon="fa-bullseye" label="Practice" />
            <NavItem m="DICTIONARY" icon="fa-book" label="Learn Symbols" />
          </nav>

          <div className="hidden lg:flex items-center space-x-4 bg-slate-100 px-5 py-3 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                <i className="fas fa-medal text-white text-sm"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Current Rank</span>
                <span className="text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {getRank()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
        {mode === 'HOME' && (
          <div className="space-y-10 animate-in fade-in duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="relative bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 rounded-[3rem] p-12 text-white overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                      
                      <div className="relative z-10">
                         <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-blue-400/30">
                           <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                           <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Ace Your NSC Journey</span>
                         </div>
                         
                         <h2 className="text-5xl font-black mb-6 leading-tight">
                           Master Naval<br/>
                           <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                             Semaphore Signaling
                           </span>
                         </h2>
                         
                         <p className="text-blue-100 text-lg max-w-md mb-10 leading-relaxed">
                            The ultimate training ground for NCC Naval Wing cadets preparing for NSC competitions. Real-time practice with precision feedback.
                         </p>
                         
                         <div className="flex flex-wrap gap-4">
                           <button 
                             onClick={() => setMode('PRACTICE')}
                             className="group bg-white text-blue-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center space-x-3"
                           >
                             <i className="fas fa-play"></i>
                             <span>Start Training</span>
                             <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                           </button>
                           <button 
                             onClick={() => setMode('DICTIONARY')}
                             className="bg-blue-500/20 backdrop-blur-md border-2 border-blue-400/30 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500/30 transition-all flex items-center space-x-3"
                           >
                             <i className="fas fa-book-open"></i>
                             <span>Dictionary</span>
                           </button>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[3rem] shadow-xl border border-slate-200">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <i className="fas fa-chart-line text-white text-sm"></i>
                          </div>
                          <span>Performance Analytics</span>
                        </h3>
                        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl">
                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Accuracy %</span>
                        </div>
                      </div>
                      <div className="h-[320px] w-full">
                         {history.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={[...history].reverse()}>
                               <defs>
                                 <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                               <XAxis hide dataKey="date" />
                               <YAxis 
                                 domain={[0, 100]} 
                                 stroke="#94a3b8" 
                                 fontSize={12} 
                                 tickFormatter={(val) => `${val}%`}
                                 axisLine={false}
                                 tickLine={false}
                               />
                               <Tooltip 
                                 contentStyle={{ 
                                   borderRadius: '16px', 
                                   border: 'none', 
                                   boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                   background: 'rgba(255, 255, 255, 0.95)',
                                   backdropFilter: 'blur(8px)'
                                 }}
                               />
                               <Area 
                                 type="monotone" 
                                 dataKey="accuracy" 
                                 stroke="#2563eb" 
                                 strokeWidth={3} 
                                 fillOpacity={1} 
                                 fill="url(#colorAcc)" 
                               />
                             </AreaChart>
                           </ResponsiveContainer>
                         ) : (
                           <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                                <i className="fas fa-chart-line text-3xl text-blue-400"></i>
                              </div>
                              <p className="font-bold text-slate-600">Complete your first drill to activate analytics.</p>
                              <button
                                onClick={() => setMode('PRACTICE')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-2"
                              >
                                <span>Start Now</span>
                                <i className="fas fa-arrow-right"></i>
                              </button>
                           </div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[3rem] shadow-xl border border-slate-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full blur-3xl opacity-30"></div>
                      
                      <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center space-x-3 relative z-10">
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                           <i className="fas fa-trophy text-white text-sm"></i>
                         </div>
                         <span>Your Statistics</span>
                      </h3>
                      
                      <div className="space-y-5 relative z-10">
                         <div className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Mastery Level</span>
                               <span className="text-xs font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-full">{getRank()}</span>
                            </div>
                            <div className="h-3 w-full bg-blue-200 rounded-full overflow-hidden shadow-inner">
                               <div 
                                 className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 rounded-full shadow-lg" 
                                 style={{ width: `${history.length > 0 ? getAverageAccuracy() : 0}%` }}
                               ></div>
                            </div>
                            <div className="mt-2 text-right">
                              <span className="text-2xl font-black text-blue-700">{getAverageAccuracy()}%</span>
                              <span className="text-xs text-blue-500 ml-1">avg</span>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-lg group">
                               <div className="flex items-center space-x-3 mb-2">
                                 <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                                   <i className="fas fa-signal text-white text-xs"></i>
                                 </div>
                               </div>
                               <span className="block text-[10px] font-black text-green-600 uppercase mb-1 tracking-wider">Transmissions</span>
                               <span className="text-3xl font-black text-green-700">{getTotalTransmissions()}</span>
                            </div>
                            
                            <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-lg group">
                               <div className="flex items-center space-x-3 mb-2">
                                 <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                                   <i className="fas fa-bullseye text-white text-xs"></i>
                                 </div>
                               </div>
                               <span className="block text-[10px] font-black text-orange-600 uppercase mb-1 tracking-wider">Avg Accuracy</span>
                               <span className="text-3xl font-black text-orange-700">{getAverageAccuracy()}%</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[3rem] shadow-xl border border-slate-200">
                      <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center space-x-3">
                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                           <i className="fas fa-history text-white text-sm"></i>
                         </div>
                         <span>Recent Sessions</span>
                      </h3>
                      <div className="space-y-4 max-h-[460px] overflow-y-auto no-scrollbar pr-2">
                         {history.length > 0 ? history.slice(0, 10).map((session, idx) => (
                           <div key={session.id} className="p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl hover:shadow-md transition-all group cursor-default border border-slate-100 hover:border-blue-200">
                              <div className="flex justify-between items-start mb-3">
                                 <div className="flex items-center space-x-2">
                                   <span className={`text-xs font-black px-3 py-1.5 rounded-full ${
                                     session.accuracy > 85 
                                       ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' 
                                       : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                                   }`}>
                                      {session.accuracy}%
                                   </span>
                                   {idx === 0 && (
                                     <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-full uppercase tracking-wider">
                                       Latest
                                     </span>
                                   )}
                                 </div>
                                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{new Date(session.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs font-mono font-bold text-slate-700 line-clamp-2 uppercase leading-relaxed">{session.phrase}</p>
                           </div>
                         )) : (
                           <div className="text-center py-20 text-slate-400">
                              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-inbox text-3xl text-slate-300"></i>
                              </div>
                              <p className="text-sm font-bold text-slate-500 mb-4">No sessions recorded yet.</p>
                              <button
                                onClick={() => setMode('PRACTICE')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-bold"
                              >
                                Start Your First Session →
                              </button>
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

      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 py-12">
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
             <p className="text-sm text-slate-600 font-bold">
                Developed by Vinayak Sen, NCC NAVAL WING LNCT, 1 MP NAVAL UNIT BHOPAL
             </p>
             <p className="text-xs text-slate-400 font-medium">
               © 2025 Semaphore Pro • 2025 • Version 2.0
             </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
