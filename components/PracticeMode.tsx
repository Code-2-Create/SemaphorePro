import React, { useState } from 'react';
import Signalman from './Signalman';
import { SEMAPHORE_MAP } from '../constants';
import { SPECIAL_SYMBOL_DICTIONARY, NUMBER_TO_WORD } from "../constants";


const Dictionary: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create combined dictionary entries
  const allEntries = [
    // Letters A-Z
    ...SEMAPHORE_MAP.filter(m => m.char >= 'A' && m.char <= 'Z').map(m => ({
      char: m.char,
      type: 'letter' as const,
      left: m.left,
      right: m.right,
      description: `Letter ${m.char}`
    })),
    // Numbers 0-9
    ...Object.entries(NUMBER_TO_WORD).map(([digit, word]) => ({
      char: digit,
      type: 'number' as const,
      word: word,
      description: `Number ${digit} (${word})`
    })),
    // Special symbols
    ...SPECIAL_SYMBOL_DICTIONARY.map(s => ({
      char: s.symbol,
      type: 'symbol' as const,
      group: s.group,
      name: s.name,
      description: `${s.name} (${s.group})`
    })),
    // NUM indicator
    {
      char: '#',
      type: 'indicator' as const,
      left: SEMAPHORE_MAP.find(m => m.char === '#')!.left,
      right: SEMAPHORE_MAP.find(m => m.char === '#')!.right,
      description: 'Numeric Indicator (NUM)'
    },
    // Space/Rest
    {
      char: ' ',
      type: 'rest' as const,
      left: 0,
      right: 0,
      description: 'Rest Position (Space)'
    }
  ];

  const filteredEntries = allEntries.filter(entry => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    
    if (entry.type === 'letter') {
      return entry.char.toLowerCase().includes(query);
    } else if (entry.type === 'number') {
      return entry.char.includes(query) || entry.word!.toLowerCase().includes(query) || 'number'.includes(query);
    } else if (entry.type === 'symbol') {
      return entry.char.includes(query) || entry.name!.toLowerCase().includes(query) || entry.group!.toLowerCase().includes(query);
    } else if (entry.type === 'indicator') {
      return 'num'.includes(query) || 'numeric'.includes(query) || 'number'.includes(query);
    } else {
      return 'space'.includes(query) || 'rest'.includes(query);
    }
  });

  const getEntryDisplay = (entry: typeof allEntries[0]) => {
    if (entry.type === 'letter') return entry.char;
    if (entry.type === 'number') return entry.char;
    if (entry.type === 'symbol') return entry.char;
    if (entry.type === 'indicator') return 'NUM';
    return 'SPC';
  };

  const getEntryColor = (entry: typeof allEntries[0]) => {
    if (entry.type === 'letter') return 'bg-slate-50 border-slate-200';
    if (entry.type === 'number') return 'bg-blue-50 border-blue-200';
    if (entry.type === 'symbol') return 'bg-purple-50 border-purple-200';
    if (entry.type === 'indicator') return 'bg-amber-50 border-amber-200';
    return 'bg-green-50 border-green-200';
  };

  const selectedEntry = selectedChar 
    ? allEntries.find(e => e.char === selectedChar) 
    : null;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4 xl:col-span-3 bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
            <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <i className="fas fa-book-open text-white text-sm"></i>
              </div>
              <span>Signal Dictionary</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
            {filteredEntries.map((entry) => (
              <button
                key={entry.char}
                onClick={() => setSelectedChar(entry.char)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all border-2 ${
                  selectedChar === entry.char
                    ? "bg-blue-50 border-blue-500 scale-105 shadow-md z-10"
                    : getEntryColor(entry) + " border-transparent hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {(entry.type === 'letter' || entry.type === 'indicator' || entry.type === 'rest') && (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Signalman
                      leftPos={entry.left!}
                      rightPos={entry.right!}
                      size={35}
                      animate={false}
                    />
                  </div>
                )}
                {entry.type === 'number' && (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <span className="text-2xl font-black text-blue-600">{entry.char}</span>
                  </div>
                )}
                {entry.type === 'symbol' && (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <span className="text-2xl font-black text-purple-600">{entry.char}</span>
                  </div>
                )}
                <span className="mt-1 font-bold text-slate-700 text-xs">
                  {getEntryDisplay(entry)}
                </span>
              </button>
            ))}

            {filteredEntries.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400">
                <i className="fas fa-search text-3xl mb-2 block"></i>
                <p className="text-sm">No signals match your search.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center lg:sticky lg:top-24 h-fit border-t-4 border-blue-500">
          {selectedEntry ? (
            <>
              <div className="flex justify-between w-full mb-4 items-center">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                  Details
                </span>
                <button
                  onClick={() => setSelectedChar(null)}
                  className="text-slate-400 hover:text-white w-8 h-8 rounded-lg hover:bg-slate-700 flex items-center justify-center transition-all"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <h3 className="text-2xl font-black mb-2">
                {selectedEntry.type === 'letter' && `${selectedEntry.char}`}
                {selectedEntry.type === 'number' && `${selectedEntry.char}`}
                {selectedEntry.type === 'symbol' && selectedEntry.name}
                {selectedEntry.type === 'indicator' && 'NUM'}
                {selectedEntry.type === 'rest' && 'REST'}
              </h3>

              <p className="text-xs text-slate-400 mb-5">
                {selectedEntry.type === 'letter' && 'Letter Signal'}
                {selectedEntry.type === 'number' && `Transmitted as: ${selectedEntry.word}`}
                {selectedEntry.type === 'symbol' && `Signal: ${selectedEntry.group}`}
                {selectedEntry.type === 'indicator' && 'Number Marker'}
                {selectedEntry.type === 'rest' && 'Space / Rest'}
              </p>

              {(selectedEntry.type === 'letter' || selectedEntry.type === 'indicator' || selectedEntry.type === 'rest') && (
                <>
                  <div className="bg-white rounded-2xl p-5 mb-6 shadow-lg">
                    <Signalman
                      leftPos={selectedEntry.left!}
                      rightPos={selectedEntry.right!}
                      size={Math.min(window.innerWidth - 150, 200)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs w-full">
                    <div className="bg-slate-800 p-3 rounded-xl text-center border border-slate-700/50">
                      <span className="block text-slate-500 font-bold uppercase text-[9px] mb-1">
                        Left Arm
                      </span>
                      <span className="font-mono text-blue-300 text-base font-bold">
                        Pos {selectedEntry.left}
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 rounded-xl text-center border border-slate-700/50">
                      <span className="block text-slate-500 font-bold uppercase text-[9px] mb-1">
                        Right Arm
                      </span>
                      <span className="font-mono text-blue-300 text-base font-bold">
                        Pos {selectedEntry.right}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {selectedEntry.type === 'number' && (
                <div className="w-full space-y-3">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                    <span className="block text-slate-500 font-bold uppercase text-[9px] mb-2">
                      Format
                    </span>
                    <div className="font-mono text-blue-300 text-sm space-y-1">
                      <div className="text-amber-400 text-xs">NUM</div>
                      <div className="text-lg text-white font-black">{selectedEntry.word}</div>
                      <div className="text-amber-400 text-xs">NUM</div>
                    </div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50 text-left">
                    <span className="block text-slate-500 font-bold uppercase text-[9px] mb-2">
                      Example
                    </span>
                    <p className="text-xs text-slate-300 font-mono">
                      ZONE {selectedEntry.char}<br/>
                      → ZONE NUM {selectedEntry.word} NUM
                    </p>
                  </div>
                </div>
              )}

              {selectedEntry.type === 'symbol' && (
                <div className="w-full space-y-3">
                  <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
                    <div className="text-5xl mb-3 text-purple-400">{selectedEntry.char}</div>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                    <span className="block text-slate-500 font-bold uppercase text-[9px] mb-2">
                      Sequence
                    </span>
                    <div className="font-mono text-blue-300 text-xl font-black">
                      {selectedEntry.group}
                    </div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50 text-left">
                    <span className="block text-slate-500 font-bold uppercase text-[9px] mb-2">
                      Breakdown
                    </span>
                    <p className="text-xs text-slate-300 font-mono">
                      {selectedEntry.group!.split('').join(' → ')}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-hand-pointer text-2xl text-blue-400 animate-bounce"></i>
              </div>
              <p className="font-bold text-sm text-slate-400">
                Select any character
              </p>
              <div className="text-[10px] text-slate-500 space-y-1">
                <p><span className="inline-block w-2 h-2 rounded-full bg-slate-400 mr-1"></span> Letters A-Z</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span> Numbers 0-9</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1"></span> Symbols</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span> NUM</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span> REST</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Dictionary;
