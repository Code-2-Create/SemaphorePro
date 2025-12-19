import React, { useState, useEffect, useCallback, useRef } from "react";
import Signalman from "./Signalman";
import {
  GET_CHAR_MAPPING,
  SAMPLE_NAVAL_PHRASES,
  SAMPLE_WORDS,
} from "../constants";
import { TrainingSession } from "../types";
import { SPECIAL_GROUPS, SYMBOL_TO_GROUP } from "../constants";

interface PracticeModeProps {
  onSessionComplete: (session: TrainingSession) => void;
}

const PracticeMode: React.FC<PracticeModeProps> = ({ onSessionComplete }) => {
  const [phrase, setPhrase] = useState("");
  const [transmissionQueue, setTransmissionQueue] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [userInput, setUserInput] = useState("");
  const [speedLevel, setSpeedLevel] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getDelay = (level: number) => {
    return Math.max(50, 2000 - level * 19.5);
  };

  const generateExtensiveDrill = () => {
    const words: string[] = [];
    const nums: string[] = [];
    for (let i = 0; i < 40; i++) {
      words.push(SAMPLE_WORDS[Math.floor(Math.random() * SAMPLE_WORDS.length)]);
    }
    for (let i = 0; i < 40; i++) {
      nums.push(Math.floor(Math.random() * 10).toString());
    }
    return words.join(" ") + " " + nums.join("");
  };

  // const buildTransmissionQueue = (text: string | undefined) => {
  //   if (!text) return [];
  //   const queue: string[] = [];
  //   let isNumberMode = false;

  //   for (const char of text.toUpperCase()) {
  //     if (char >= '0' && char <= '9') {
  //       if (!isNumberMode) {
  //         queue.push('#');
  //         isNumberMode = true;
  //       }
  //       queue.push(char);
  //     } else if (char === ' ') {
  //       isNumberMode = false;
  //       queue.push(' ');
  //     } else {
  //       if (isNumberMode) isNumberMode = false;
  //       queue.push(char);
  //     }
  //   }
  //   return queue;
  // };

  const buildTransmissionQueue = (text?: string) => {
    if (!text) return [];

    const queue: string[] = [];
    let numberMode = false;

    for (const char of text.toUpperCase()) {
      if (SYMBOL_TO_GROUP[char]) {
        const group = SYMBOL_TO_GROUP[char];
        for (const g of group) queue.push(g);
        continue;
      }

      if (char >= "0" && char <= "9") {
        if (!numberMode) {
          queue.push("#");
          numberMode = true;
        }
        queue.push(char);
      } else if (char === " ") {
        numberMode = false;
        queue.push(" ");
      } else if (char >= "A" && char <= "Z") {
        numberMode = false;
        queue.push(char);
      }
    }

    return queue;
  };

  const decodeSpecialGroups = (text: string) => {
    let result = text;
    Object.entries(SPECIAL_GROUPS).forEach(([group, symbol]) => {
      result = result.replaceAll(group, symbol);
    });
    return result;
  };

  const startPractice = (type: "short" | "long" | "drill") => {
    let newPhrase = "";
    if (type === "drill") {
      newPhrase = generateExtensiveDrill();
    } else {
      let pool = SAMPLE_NAVAL_PHRASES;
      if (type === "short") {
        pool = SAMPLE_NAVAL_PHRASES.filter((p) => p.split(" ").length <= 5);
      } else if (type === "long") {
        pool = SAMPLE_NAVAL_PHRASES.filter((p) => p.split(" ").length > 5);
      }
      newPhrase =
        pool[Math.floor(Math.random() * pool.length)] ||
        SAMPLE_NAVAL_PHRASES[0];
    }

    const queue = buildTransmissionQueue(newPhrase);
    setPhrase(newPhrase);
    setTransmissionQueue(queue);
    setCurrentIndex(-1);
    setUserInput("");
    setIsFinished(false);
    setIsPlaying(true);
  };

  const handleNextChar = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev + 1 < transmissionQueue.length) {
        return prev + 1;
      } else {
        setIsPlaying(false);
        return prev;
      }
    });
  }, [transmissionQueue]);

  useEffect(() => {
    if (isPlaying && currentIndex < transmissionQueue.length) {
      timerRef.current = setTimeout(handleNextChar, getDelay(speedLevel));
    } else if (
      currentIndex >= transmissionQueue.length - 1 &&
      transmissionQueue.length > 0
    ) {
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, transmissionQueue, speedLevel, handleNextChar]);

  const handleSubmit = () => {
    const accuracy = calculateAccuracy(phrase, userInput);
    const session: TrainingSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: Date.now(),
      accuracy,
      speedMs: getDelay(speedLevel),
      phrase,
      userPhrase: userInput.toUpperCase(),
      type: phrase.split(" ").length > 10 ? "Long" : "Short",
    };
    onSessionComplete(session);
    setIsFinished(true);
  };

  // const calculateAccuracy = (original: string | undefined, user: string | undefined) => {
  //   const o = (original || "").toUpperCase().replace(/\s/g, '');
  //   const u = (user || "").toUpperCase().replace(/\s/g, '');
  //   let matches = 0;
  //   const len = Math.max(o.length, u.length);
  //   if (len === 0) return 100;
  //   for (let i = 0; i < Math.min(o.length, u.length); i++) {
  //     if (o[i] === u[i]) matches++;
  //   }
  //   return Math.round((matches / len) * 100);
  // };

  const calculateAccuracy = (original?: string, user?: string) => {
    const o = decodeSpecialGroups((original || "").toUpperCase()).replace(
      /\s/g,
      ""
    );
    const u = (user || "").toUpperCase().replace(/\s/g, "");

    let correct = 0;
    const len = Math.max(o.length, u.length);
    if (!len) return 100;

    for (let i = 0; i < Math.min(o.length, u.length); i++) {
      if (o[i] === u[i]) correct++;
    }

    return Math.round((correct / len) * 100);
  };

  const currentChar =
    currentIndex >= 0 && currentIndex < transmissionQueue.length
      ? transmissionQueue[currentIndex]
      : " ";
  const currentSignal = GET_CHAR_MAPPING(currentChar);

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-4xl">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full flex flex-col items-center relative overflow-hidden">
        {/* Dynamic Background Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 opacity-50"></div>

        <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8 space-y-6 md:space-y-0">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {!isPlaying ? (
              <>
                <button
                  onClick={() => startPractice("short")}
                  className="px-5 py-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-xs font-bold text-slate-600 flex items-center space-x-2"
                >
                  <i className="fas fa-bolt text-amber-500"></i>
                  <span>Short</span>
                </button>
                <button
                  onClick={() => startPractice("long")}
                  className="px-5 py-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-xs font-bold text-slate-600 flex items-center space-x-2"
                >
                  <i className="fas fa-anchor text-blue-500"></i>
                  <span>Message</span>
                </button>
                <button
                  onClick={() => startPractice("drill")}
                  className="px-5 py-2.5 bg-blue-600 shadow-md rounded-xl transition-all text-xs font-black text-white flex items-center space-x-2"
                >
                  <i className="fas fa-shield-halved"></i>
                  <span>40x40 Drill</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsPlaying(false)}
                className="px-8 py-2.5 bg-red-500 text-white shadow-lg rounded-xl transition-all text-xs font-black flex items-center space-x-2 animate-pulse"
              >
                <i className="fas fa-stop"></i>
                <span>ABORT TRANSMISSION</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setShowHints(!showHints)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                showHints
                  ? "bg-amber-50 border-amber-200 text-amber-600 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <i className={`fas ${showHints ? "fa-eye" : "fa-eye-slash"}`}></i>
              <span className="text-[10px] font-black uppercase tracking-widest">
                {showHints ? "Hints ON" : "Hints OFF"}
              </span>
            </button>

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Speed Multiplier
              </span>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={speedLevel}
                  onChange={(e) => setSpeedLevel(parseInt(e.target.value))}
                  className="w-32 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />
                <span className="text-sm font-mono font-bold text-blue-600 w-12 text-right">
                  {speedLevel}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center py-4">
          {/* Real-time Hint Overlay */}
          {isPlaying && showHints && currentChar !== " " && (
            <div className="absolute top-0 bg-white/90 backdrop-blur-sm border-2 border-amber-500 text-amber-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shadow-xl z-20 animate-bounce">
              {currentChar === "#" ? "#" : currentChar}
            </div>
          )}

          <Signalman
            leftPos={currentSignal.left}
            rightPos={currentSignal.right}
            size={360}
          />

          <div className="mt-10 flex flex-col items-center w-full max-w-sm">
            <div className="flex justify-between w-full text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-3">
              <span className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? "bg-green-500 animate-ping" : "bg-slate-300"
                  }`}
                ></span>
                <span>
                  Signal:{" "}
                  {currentChar === "#"
                    ? "NUMERIC"
                    : currentChar === " "
                    ? "REST"
                    : currentChar}
                </span>
              </span>
              <span>
                {transmissionQueue.length > 0
                  ? `${currentIndex + 1} / ${transmissionQueue.length}`
                  : "STANDBY"}
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-1 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                style={{
                  width: `${
                    transmissionQueue.length > 0
                      ? ((currentIndex + 1) / transmissionQueue.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {phrase && !isPlaying && (
        <div className="w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <i className="fas fa-keyboard"></i>
              </div>
              <span>Decode Transcription</span>
            </h3>
            {isFinished && (
              <div
                className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                  calculateAccuracy(phrase, userInput) > 85
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {calculateAccuracy(phrase, userInput)}% Accuracy
              </div>
            )}
          </div>

          <textarea
            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono text-xl uppercase placeholder:text-slate-300 no-scrollbar shadow-inner"
            rows={4}
            placeholder="Type your decoded message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isFinished}
          />

          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <button
              onClick={() => {
                setIsPlaying(true);
                setCurrentIndex(-1);
              }}
              className="group text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center space-x-3 px-6 py-3 rounded-2xl hover:bg-blue-50"
            >
              <i className="fas fa-redo group-hover:rotate-180 transition-transform duration-500"></i>
              <span>Re-run Sequence</span>
            </button>

            {!isFinished ? (
              <button
                onClick={handleSubmit}
                className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center space-x-3"
              >
                <span>Submit Log</span>
                <i className="fas fa-paper-plane"></i>
              </button>
            ) : (
              // <div className="flex flex-col items-end bg-green-50 p-6 rounded-[1.5rem] border border-green-100 w-full overflow-hidden shadow-sm">
              //   <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">Original Secure Message</p>
              //   <p className="text-lg font-mono font-bold text-green-800 break-all leading-relaxed">{phrase}</p>
              // </div>
              <div className="flex flex-col items-end bg-green-50 p-6 rounded-[1.5rem] border border-green-100 w-full overflow-hidden shadow-sm">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">
                  Original Secure Message
                </p>
                <p className="text-lg font-mono font-bold text-green-800 break-all leading-relaxed">
                  {decodeSpecialGroups(phrase)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeMode;
