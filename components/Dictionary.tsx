
import React, { useState } from 'react';
import Signalman from './Signalman';
import { SEMAPHORE_MAP } from '../constants';
import { SPECIAL_SYMBOL_DICTIONARY } from "../constants";


const Dictionary: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMap = SEMAPHORE_MAP.filter(m => 
    m.char !== ' ' && 
    (m.char.toLowerCase().includes(searchQuery.toLowerCase()) || 
     (searchQuery === "number" && m.char >= '0' && m.char <= '9'))
  );


return (
    <div className="space-y-10 w-full max-w-6xl animate-in fade-in duration-500">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3 bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <i className="fas fa-book-open text-blue-500"></i>
              <span>Signal Dictionary</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search letter or number..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
            {filteredMap.map((m) => (
              <button
                key={m.char}
                onClick={() => setSelectedChar(m.char)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all border-2 ${
                  selectedChar === m.char
                    ? "bg-blue-50 border-blue-500 scale-105 z-10"
                    : "bg-slate-50 border-transparent hover:border-slate-300"
                }`}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <Signalman
                    leftPos={m.left}
                    rightPos={m.right}
                    size={40}
                    animate={false}
                  />
                </div>
                <span className="mt-2 font-bold text-slate-700 text-lg">
                  {m.char === "#" ? "NUM" : m.char}
                </span>
              </button>
            ))}

            {filteredMap.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <i className="fas fa-search text-3xl mb-2 block"></i>
                <p>No signals match your search.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center sticky top-24 h-fit border-t-4 border-blue-500">
          {selectedChar ? (
            <>
              <div className="flex justify-between w-full mb-4 items-center">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  Detail View
                </span>
                <button
                  onClick={() => setSelectedChar(null)}
                  className="text-slate-500 hover:text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <h3 className="text-4xl font-black mb-6">
                {selectedChar === "#"
                  ? "Numeric Indicator"
                  : `Signal: ${selectedChar}`}
              </h3>

              <div className="bg-white rounded-3xl p-6 mb-8 shadow-inner">
                <Signalman
                  leftPos={
                    SEMAPHORE_MAP.find((m) => m.char === selectedChar)!.left
                  }
                  rightPos={
                    SEMAPHORE_MAP.find((m) => m.char === selectedChar)!.right
                  }
                  size={220}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs w-full">
                <div className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700/50">
                  <span className="block text-slate-500 font-bold uppercase mb-1">
                    Left Arm
                  </span>
                  <span className="font-mono text-blue-300 text-lg">
                    Pos{" "}
                    {SEMAPHORE_MAP.find((m) => m.char === selectedChar)!.left}
                  </span>
                </div>

                <div className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700/50">
                  <span className="block text-slate-500 font-bold uppercase mb-1">
                    Right Arm
                  </span>
                  <span className="font-mono text-blue-300 text-lg">
                    Pos{" "}
                    {SEMAPHORE_MAP.find((m) => m.char === selectedChar)!.right}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 space-y-6">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-hand-pointer text-3xl text-blue-400 animate-bounce"></i>
              </div>
              <p className="font-bold text-slate-400">
                Select a character to inspect semaphore positions.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
        <h3 className="text-sm font-black tracking-widest text-slate-600 mb-6">
          SPECIAL SYMBOLS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {SPECIAL_SYMBOL_DICTIONARY.map((s) => (
            <div
              key={s.group}
              className="flex flex-col items-center p-4 rounded-2xl border bg-slate-50 shadow-sm"
            >
              <span className="text-xl font-mono font-black">{s.group}</span>
              <span className="text-2xl font-black text-blue-600 mt-2">
                {s.symbol}
              </span>
              <span className="text-xs text-slate-500 mt-1 text-center">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default Dictionary;
