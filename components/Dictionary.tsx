import React, { useState, useEffect, useCallback, useRef } from "react";
import Signalman from "./Signalman";
import { SEMAPHORE_MAP, GET_CHAR_MAPPING } from "../constants";
import { SPECIAL_SYMBOL_DICTIONARY, NUMBER_TO_WORD } from "../constants";
import tricksImage from "./tricks.svg";
import { SemaphorePosition } from "../types";

// NATO Alphabet data with flag meanings and semaphore meanings
const natoAlphabetData: Record<string, {
  letter: string;
  word: string;
  image: string;
  flagMeaning: string[];
  semaphoreMeaning: string[] | null;
}> = {
  A: {
    letter: "A",
    word: "Alfa",
    image: "Flags/ICS_Alfa.svg",
    flagMeaning: ["I have a diver down; keep well clear at slow speed."],
    semaphoreMeaning: ["Permission granted.", "'AR': End of transmission.", "'AS': Wait."]
  },
  B: {
    letter: "B",
    word: "Bravo",
    image: "Flags/ICS_Bravo.svg",
    flagMeaning: ["I am taking in or discharging or carrying dangerous goods/explosives."],
    semaphoreMeaning: ["More to follow.", "'BT': Break."]
  },
  C: {
    letter: "C",
    word: "Charlie",
    image: "Flags/ICS_Charlie.svg",
    flagMeaning: ["Aircraft to land."],
    semaphoreMeaning: ["Yes/Affirmative/Correct."]
  },
  D: {
    letter: "D",
    word: "Delta",
    image: "Flags/ICS_Delta.svg",
    flagMeaning: ["Keep clear of me; I am maneuvering with difficulty."],
    semaphoreMeaning: null
  },
  E: {
    letter: "E",
    word: "Echo",
    image: "Flags/ICS_Echo.svg",
    flagMeaning: ["I am altering my course to starboard."],
    semaphoreMeaning: ["Error Sign: Made by successions of E's."]
  },
  F: {
    letter: "F",
    word: "Foxtrot",
    image: "Flags/ICS_Foxtrot.svg",
    flagMeaning: ["I am disabled."],
    semaphoreMeaning: null
  },
  G: {
    letter: "G",
    word: "Golf",
    image: "Flags/ICS_Golf.svg",
    flagMeaning: ["I require a pilot."],
    semaphoreMeaning: null
  },
  H: {
    letter: "H",
    word: "Hotel",
    image: "Flags/ICS_Hotel.svg",
    flagMeaning: ["I have a pilot on board."],
    semaphoreMeaning: null
  },
  I: {
    letter: "I",
    word: "India",
    image: "Flags/ICS_India.svg",
    flagMeaning: [
      "I am altering my course to port.",
      "At harbor: Ready to receive you alongside.",
      "At sea: Ready to come alongside you."
    ],
    semaphoreMeaning: ["Separative Sign: 'II' denotes paragraph change."]
  },
  J: {
    letter: "J",
    word: "Juliett",
    image: "Flags/ICS_Juliett.svg",
    flagMeaning: ["Keep well clear of me: I am on fire and have dangerous cargo on board."],
    semaphoreMeaning: ["Direction Sign: By making 'J'."]
  },
  K: {
    letter: "K",
    word: "Kilo",
    image: "Flags/ICS_Kilo.svg",
    flagMeaning: ["I wish to communicate with you.", "I am operating helicopters."],
    semaphoreMeaning: null
  },
  L: {
    letter: "L",
    word: "Lima",
    image: "Flags/ICS_Lima.svg",
    flagMeaning: ["Stop your vessel immediately."],
    semaphoreMeaning: null
  },
  M: {
    letter: "M",
    word: "Mike",
    image: "Flags/ICS_Mike.svg",
    flagMeaning: [
      "My vessel is stopped and making no way through the water.",
      "At sea: Carrying stretcher patient.",
      "At harbor: Medical duty ship."
    ],
    semaphoreMeaning: null
  },
  N: {
    letter: "N",
    word: "November",
    image: "Flags/ICS_November.svg",
    flagMeaning: ["Negative/No."],
    semaphoreMeaning: null
  },
  O: {
    letter: "O",
    word: "Oscar",
    image: "Flags/ICS_Oscar.svg",
    flagMeaning: ["Man overboard."],
    semaphoreMeaning: null
  },
  P: {
    letter: "P",
    word: "Papa",
    image: "Flags/ICS_Papa.svg",
    flagMeaning: ["In harbour: All persons should report on board as the vessel is about to proceed to sea."],
    semaphoreMeaning: null
  },
  Q: {
    letter: "Q",
    word: "Quebec",
    image: "Flags/ICS_Quebec.svg",
    flagMeaning: ["My vessel is 'healthy' and I request free pratique."],
    semaphoreMeaning: null
  },
  R: {
    letter: "R",
    word: "Romeo",
    image: "Flags/ICS_Romeo.svg",
    flagMeaning: ["Preparing for RAS (Replenishment At Sea).", "At harbor: Ready duty ship."],
    semaphoreMeaning: null
  },
  S: {
    letter: "S",
    word: "Sierra",
    image: "Flags/ICS_Sierra.svg",
    flagMeaning: ["I am operating astern propulsion/ moving forward.", "Drill Signal."],
    semaphoreMeaning: null
  },
  T: {
    letter: "T",
    word: "Tango",
    image: "Flags/ICS_Tango.svg",
    flagMeaning: ["Keep clear of me: I am engaged in travelling."],
    semaphoreMeaning: null
  },
  U: {
    letter: "U",
    word: "Uniform",
    image: "Flags/ICS_Uniform.svg",
    flagMeaning: ["You are running into danger.", "At harbor: I am anchoring/ weighing anchor."],
    semaphoreMeaning: ["Attention Sign: By making 'U' and arms waved up and down."]
  },
  V: {
    letter: "V",
    word: "Victor",
    image: "Flags/ICS_Victor.svg",
    flagMeaning: ["I require assistance.", "Ship is open to visitors."],
    semaphoreMeaning: null
  },
  W: {
    letter: "W",
    word: "Whiskey",
    image: "Flags/ICS_Whiskey.svg",
    flagMeaning: ["I require medical assistance."],
    semaphoreMeaning: ["'WB': Word before.", "'WA': Word after."]
  },
  X: {
    letter: "X",
    word: "X-ray",
    image: "Flags/ICS_X-ray.svg",
    flagMeaning: ["Stop carrying out your intentions and watch for my signals.", "Exercise."],
    semaphoreMeaning: null
  },
  Y: {
    letter: "Y",
    word: "Yankee",
    image: "Flags/ICS_Yankee.svg",
    flagMeaning: ["I am dragging my anchor.", "I am keeping visual watch."],
    semaphoreMeaning: null
  },
  Z: {
    letter: "Z",
    word: "Zulu",
    image: "Flags/ICS_Zulu.svg",
    flagMeaning: ["I require a tug."],
    semaphoreMeaning: null
  }
};

const flagImages = import.meta.glob("./Flags/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const Dictionary: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [animationIndex, setAnimationIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedNATOLetter, setSelectedNATOLetter] = useState<string | null>(null);
  const getFlagSrc = (relativePath: string) =>
    flagImages[`./${relativePath}`] ??
    new URL(`./${relativePath}`, import.meta.url).href;

  // Number to word mapping for animation
  const NUMBER_WORD_MAP: Record<string, string> = {
    "0": "ZRO",
    "1": "ONE",
    "2": "TWO",
    "3": "TRE",
    "4": "FOR",
    "5": "FIV",
    "6": "SIX",
    "7": "SVN",
    "8": "ATE",
    "9": "NIN",
  };

  // Symbol to group mapping for animation
  const SYMBOL_GROUP_MAP: Record<string, string> = {
    "(": "KN",
    ")": "KK",
    ".": "AAA",
    ",": "MIM",
    "-": "DU",
    "/": "XE",
  };

  // Create combined dictionary entries
  const allEntries = [
    // Letters A-Z
    ...SEMAPHORE_MAP.filter((m) => m.char >= "A" && m.char <= "Z").map((m) => ({
      char: m.char,
      type: "letter" as const,
      left: m.left,
      right: m.right,
      description: `Letter ${m.char}`,
    })),
    // Numbers 0-9
    ...Object.entries(NUMBER_TO_WORD).map(([digit, word]) => ({
      char: digit,
      type: "number" as const,
      word: word,
      description: `Number ${digit} (${word})`,
    })),
    // Special symbols
    ...SPECIAL_SYMBOL_DICTIONARY.map((s) => ({
      char: s.symbol,
      type: "symbol" as const,
      group: s.group,
      name: s.name,
      description: `${s.name} (${s.group})`,
    })),
    // NUM indicator
    {
      char: "#",
      type: "indicator" as const,
      left: SEMAPHORE_MAP.find((m) => m.char === "#")!.left,
      right: SEMAPHORE_MAP.find((m) => m.char === "#")!.right,
      description: "Numeric Indicator (NUM)",
    },
    // Space/Rest
    {
      char: " ",
      type: "rest" as const,
      left: 0,
      right: 0,
      description: "Rest Position (Space)",
    },
  ];

  const filteredEntries = allEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    if (entry.type === "letter") {
      return entry.char.toLowerCase().includes(query);
    } else if (entry.type === "number") {
      return (
        entry.char.includes(query) ||
        entry.word!.toLowerCase().includes(query) ||
        "number".includes(query)
      );
    } else if (entry.type === "symbol") {
      return (
        entry.char.includes(query) ||
        entry.name!.toLowerCase().includes(query) ||
        entry.group!.toLowerCase().includes(query)
      );
    } else if (entry.type === "indicator") {
      return (
        "num".includes(query) ||
        "numeric".includes(query) ||
        "number".includes(query)
      );
    } else {
      return "space".includes(query) || "rest".includes(query);
    }
  });

  const getEntryDisplay = (entry: (typeof allEntries)[0]) => {
    if (entry.type === "letter") return entry.char;
    if (entry.type === "number") return entry.word; // ZRO, ONE, TWO, ...
    if (entry.type === "symbol") return entry.group;
    if (entry.type === "indicator") return "NUM";
    return "SPC";
  };

  const getEntryColor = (entry: (typeof allEntries)[0]) => {
    if (entry.type === "letter") return "bg-slate-50 border-slate-200";
    if (entry.type === "number") return "bg-blue-50 border-blue-200";
    if (entry.type === "symbol") return "bg-purple-50 border-purple-200";
    if (entry.type === "indicator") return "bg-amber-50 border-amber-200";
    return "bg-green-50 border-green-200";
  };

  const selectedEntry = selectedChar
    ? allEntries.find((e) => e.char === selectedChar)
    : null;

  // Get animation sequence for selected entry
  const getAnimationSequence = (entry: typeof selectedEntry): string => {
    if (!entry) return "";
    if (entry.type === "number") {
      return NUMBER_WORD_MAP[entry.char] || "";
    }
    if (entry.type === "symbol") {
      return SYMBOL_GROUP_MAP[entry.char] || "";
    }
    return "";
  };

  // Start animation when entry changes
  // Start animation when entry changes
  useEffect(() => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
    }

    if (
      selectedEntry &&
      (selectedEntry.type === "number" || selectedEntry.type === "symbol")
    ) {
      const sequence = getAnimationSequence(selectedEntry);
      if (sequence) {
        setAnimationIndex(0);
        setIsAnimating(true);

        animationTimerRef.current = setInterval(() => {
          setAnimationIndex((prev) => {
            const next = prev + 1;
            if (next >= sequence.length) {
              if (animationTimerRef.current) {
                clearInterval(animationTimerRef.current);
              }
              setIsAnimating(false);
              return prev; // Stop at last character
            }
            return next;
          });
        }, 1000); // Change character every 800ms
      }
    } else {
      setIsAnimating(false);
      setAnimationIndex(0);
    }

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [selectedChar]);

  // Get current character position for animation
  const getCurrentAnimationPosition = () => {
    if (!selectedEntry || !isAnimating) return { left: 0, right: 0 };

    const sequence = getAnimationSequence(selectedEntry);
    if (!sequence || animationIndex >= sequence.length)
      return { left: 0, right: 0 };

    const currentChar = sequence[animationIndex];
    const mapping = GET_CHAR_MAPPING(currentChar);
    return { left: mapping.left, right: mapping.right };
  };

  const currentAnimationPos = getCurrentAnimationPosition();

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
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2 min-h-[80px] ${
                  selectedChar === entry.char
                    ? "bg-blue-50 border-blue-500 scale-105 shadow-md z-10"
                    : getEntryColor(entry) +
                      " border-transparent hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {(entry.type === "letter" ||
                  entry.type === "indicator" ||
                  entry.type === "rest") && (
                  <div className="w-12 h-12 flex items-center justify-center mb-1">
                    <svg viewBox="0 0 200 200" width="48" height="48">
                      <g
                        style={{
                          transform: `rotate(${entry.left! * 45 - 180}deg)`,
                          transformOrigin: "100px 100px",
                        }}
                      >
                        <line
                          x1="100"
                          y1="100"
                          x2="100"
                          y2="40"
                          stroke="#334155"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <line
                          x1="100"
                          y1="40"
                          x2="100"
                          y2="10"
                          stroke="#475569"
                          strokeWidth="3"
                        />
                      </g>
                      <g
                        style={{
                          transform: `rotate(${entry.right! * 45 - 180}deg)`,
                          transformOrigin: "100px 100px",
                        }}
                      >
                        <line
                          x1="100"
                          y1="100"
                          x2="100"
                          y2="40"
                          stroke="#334155"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <line
                          x1="100"
                          y1="40"
                          x2="100"
                          y2="10"
                          stroke="#475569"
                          strokeWidth="3"
                        />
                      </g>
                      <circle cx="100" cy="100" r="8" fill="#1e293b" />
                    </svg>
                  </div>
                )}
                {entry.type === "number" && (
                  <div className="w-12 h-12 flex items-center justify-center mb-1">
                    <span className="text-2xl font-black text-blue-600">
                      {entry.char}
                    </span>
                  </div>
                )}
                {entry.type === "symbol" && (
                  <div className="w-12 h-12 flex items-center justify-center mb-1">
                    <span className="text-2xl font-black text-purple-600">
                      {entry.char}
                    </span>
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
                {selectedEntry.type === "letter" && `${selectedEntry.char}`}
                {selectedEntry.type === "indicator" && "NUM"}
                {selectedEntry.type === "rest" && "REST"}
                {selectedEntry.type === "number" && `${selectedEntry.char}`}
                {selectedEntry.type === "symbol" && selectedEntry.name}
              </h3>

              <p className="text-xs text-slate-400 mb-5">
                {selectedEntry.type === "letter" && "Letter Signal"}
                {selectedEntry.type === "indicator" && "Number Marker"}
                {selectedEntry.type === "rest" && "Space / Rest"}
                {selectedEntry.type === "number" &&
                  `Transmitted as: ${selectedEntry.word}`}
                {selectedEntry.type === "symbol" &&
                  `Signal: ${selectedEntry.group}`}
              </p>

              {(selectedEntry.type === "letter" ||
                selectedEntry.type === "indicator" ||
                selectedEntry.type === "rest") && (
                <>
                  <div className="bg-white rounded-2xl p-8 mb-6 shadow-lg w-full flex items-center justify-center overflow-hidden min-h-[220px]">
                    <Signalman
                      leftPos={selectedEntry.left as SemaphorePosition}
                      rightPos={selectedEntry.right as SemaphorePosition}
                      size={Math.min(window.innerWidth - 150, 220)}
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

              {selectedEntry.type === "number" && (
                <div className="w-full space-y-3">
                  <div className="bg-white rounded-2xl p-6 mb-3 shadow-lg w-full flex flex-col items-center min-h-[340px]">
  <div className="relative">
    <Signalman
      leftPos={currentAnimationPos.left as SemaphorePosition}
      rightPos={currentAnimationPos.right as SemaphorePosition}
      size={Math.min(window.innerWidth - 150, 220)}
    />
  </div>

  <div className="mt-10 z-10 text-slate-700 font-mono text-lg font-black">
    {isAnimating && getAnimationSequence(selectedEntry)[animationIndex]}
  </div>
</div>


                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                    <span className="block text-slate-500 font-bold uppercase text-[9px] mb-2">
                      Format
                    </span>
                    <div className="font-mono text-blue-300 text-sm space-y-1">
                      <div className="text-amber-400 text-xs">NUM</div>
                      <div className="text-lg text-white font-black">
                        {selectedEntry.word}
                      </div>
                      <div className="text-amber-400 text-xs">NUM</div>
                    </div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50 text-left">
                    <span className="block text-slate-500 font-bold uppercase text-[9px] mb-2">
                      Example
                    </span>
                    <p className="text-xs text-slate-300 font-mono">
                      ZONE {selectedEntry.char}
                      <br />-&gt; ZONE NUM {selectedEntry.word} NUM
                    </p>
                  </div>
                </div>
              )}

              {selectedEntry.type === "symbol" && (
                <div className="w-full space-y-3">
                  <div className="bg-white rounded-2xl p-6 mb-3 shadow-lg w-full flex flex-col items-center min-h-[360px]">
  <div className="relative">
    <Signalman
      leftPos={currentAnimationPos.left as SemaphorePosition}
      rightPos={currentAnimationPos.right as SemaphorePosition}
      size={Math.min(window.innerWidth - 150, 200)}
    />
  </div>

  <div className="mt-12 z-10 text-slate-700 font-mono text-lg font-black">
    {isAnimating && getAnimationSequence(selectedEntry)[animationIndex]}
  </div>
</div>

                  <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
                    <div className="text-5xl mb-3 text-purple-400">
                      {selectedEntry.char}
                    </div>
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
                      {selectedEntry.group!.split("").join(" -> ")}
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
                <p>
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-400 mr-1"></span>{" "}
                  Letters A-Z
                </p>
                <p>
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>{" "}
                  Numbers 0-9
                </p>
                <p>
                  <span className="inline-block w-2 h-2 rounded-full bg-purple-400 mr-1"></span>{" "}
                  Symbols
                </p>
                <p>
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span>{" "}
                  NUM
                </p>
                <p>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>{" "}
                  REST
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* NATO Phonetic Alphabet */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border-2 border-blue-200 shadow-lg">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center space-x-2">
          <i className="fas fa-radio text-blue-600"></i>
          <span>NATO Phonetic Alphabet</span>
        </h3>
        <p className="text-sm text-slate-600 mb-5">
          Standard phonetic alphabet used in naval communications
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { letter: "A", word: "Alfa" },
            { letter: "B", word: "Bravo" },
            { letter: "C", word: "Charlie" },
            { letter: "D", word: "Delta" },
            { letter: "E", word: "Echo" },
            { letter: "F", word: "Foxtrot" },
            { letter: "G", word: "Golf" },
            { letter: "H", word: "Hotel" },
            { letter: "I", word: "India" },
            { letter: "J", word: "Juliett" },
            { letter: "K", word: "Kilo" },
            { letter: "L", word: "Lima" },
            { letter: "M", word: "Mike" },
            { letter: "N", word: "November" },
            { letter: "O", word: "Oscar" },
            { letter: "P", word: "Papa" },
            { letter: "Q", word: "Quebec" },
            { letter: "R", word: "Romeo" },
            { letter: "S", word: "Sierra" },
            { letter: "T", word: "Tango" },
            { letter: "U", word: "Uniform" },
            { letter: "V", word: "Victor" },
            { letter: "W", word: "Whiskey" },
            { letter: "X", word: "X-ray" },
            { letter: "Y", word: "Yankee" },
            { letter: "Z", word: "Zulu" },
          ].map((item) => (
            <button
              key={item.letter}
              onClick={() => setSelectedNATOLetter(item.letter)}
              className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-xl p-3 text-center hover:shadow-md hover:scale-105 transition-all cursor-pointer hover:border-blue-400"
            >
              <div className="text-2xl font-black text-blue-700 mb-1">
                {item.letter}
              </div>
              <div className="text-sm font-bold text-slate-700">
                {item.word}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* NATO Alphabet Modal */}
      {selectedNATOLetter && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNATOLetter(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <h2 className="text-2xl font-black">
                {selectedNATOLetter} - {natoAlphabetData[selectedNATOLetter].word}
              </h2>
              <button
                onClick={() => setSelectedNATOLetter(null)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Flag Image */}
              <div className="flex  justify-center bg-slate-50 rounded-none p-6 border-2 border-slate-200">
                <img
                  src={getFlagSrc(natoAlphabetData[selectedNATOLetter].image)}
                  alt={`${natoAlphabetData[selectedNATOLetter].word} flag`}
                  className="w-48 h-48 object-contain"
                />
              </div>

              {/* Flag Meaning */}
              <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200">
                <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center space-x-2">
                  <i className="fas fa-flag text-blue-600"></i>
                  <span>Flag Meaning</span>
                </h3>
                <ul className="space-y-2">
                  {natoAlphabetData[selectedNATOLetter].flagMeaning.map((meaning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold mt-1">-</span>
                      <span className="text-slate-700">{meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Semaphore Meaning (if exists) */}
              {natoAlphabetData[selectedNATOLetter].semaphoreMeaning && (
                <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200">
                  <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center space-x-2">
                    <i className="fas fa-male text-purple-600"></i>
                    <span>Semaphore Meaning</span>
                  </h3>
                  <ul className="space-y-2">
                    {natoAlphabetData[selectedNATOLetter].semaphoreMeaning!.map((meaning, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold mt-1">-</span>
                        <span className="text-slate-700">{meaning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Section - Responsive */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-slate-200 shadow-lg">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center space-x-2">
  <i className="fas fa-image text-purple-600"></i>
  <span>Visual Learning Trick</span>
</h3>

<span className="block text-sm text-slate-600 mb-4">
  These diagrams group alphabets into mirrored pairs and octant-based patterns,
  making them easier to understand, learn, and remember at a glance.
</span>

        <div className="w-full flex justify-center items-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 min-h-[200px]">
          <img
            src={tricksImage}
            alt="Semaphore Learning Guide"
            className="w-full h-auto max-w-full rounded-xl object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Dictionary;
