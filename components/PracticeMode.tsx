import React, { useState, useEffect, useCallback, useRef } from "react";
import Signalman from "./Signalman";
import {
  GET_CHAR_MAPPING,
  SAMPLE_NAVAL_PHRASES,
  SAMPLE_WORDS,
  NUMBER_TO_WORD,
  WORD_TO_NUMBER,
} from "../constants";
import { TrainingSession } from "../types";
import { SPECIAL_GROUPS, SYMBOL_TO_GROUP } from "../constants";
import { useVoiceInput, VoiceGuideModal } from "./VoiceInput";

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
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastBlinkIndexRef = useRef<number>(-1);
  const [blinkOn, setBlinkOn] = useState(false);

  const handleVoiceTranscript = useCallback((text: string) => {
    setUserInput((prev) => prev + text);
  }, []);

  const {
    isListening,
    speechSupported,
    interimTranscript,
    voiceError,
    startRecording,
    stopRecording,
    toggleVoiceInput: voiceToggle,
    clearError,
  } = useVoiceInput(handleVoiceTranscript);

  const canStartVoiceInput =
    phrase.length > 0 && transmissionQueue.length > 0 && !isFinished;

  const toggleVoiceInput = () => {
    voiceToggle(canStartVoiceInput, () => setShowVoiceGuide(true));
  };

  const acceptVoiceGuide = () => {
    localStorage.setItem("voiceGuideSeen", "true");
    setShowVoiceGuide(false);
    startRecording();
  };

  const cancelVoiceGuide = () => {
    setShowVoiceGuide(false);
  };

  useEffect(() => {
    if (isFinished && isListening) {
      stopRecording();
    }
  }, [isFinished, isListening, stopRecording]);

  const getDelay = (level: number) => Math.max(50, 2000 - level * 19);

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

  const buildTransmissionQueue = (text?: string) => {
    if (!text) return [];
    const queue: string[] = [];
    let inNumberMode = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i].toUpperCase();

      if (SYMBOL_TO_GROUP[char]) {
        if (inNumberMode) {
          queue.push(" ");
          queue.push("#");
          inNumberMode = false;
        }
        const group = SYMBOL_TO_GROUP[char];
        for (const g of group) queue.push(g);
        continue;
      }

      if (char >= "0" && char <= "9") {
        if (!inNumberMode) {
          queue.push("#");
          queue.push(" ");
          inNumberMode = true;
        }
        const word = NUMBER_TO_WORD[char];
        for (const letter of word) queue.push(letter);
        if (i + 1 < text.length && text[i + 1] >= "0" && text[i + 1] <= "9") {
          queue.push(" ");
        }
      } else if (char === " ") {
        if (inNumberMode) {
          queue.push(" ");
          queue.push("#");
          inNumberMode = false;
        }
        queue.push(" ");
      } else if (char >= "A" && char <= "Z") {
        if (inNumberMode) {
          queue.push(" ");
          queue.push("#");
          inNumberMode = false;
        }
        queue.push(char);
      }
    }

    if (inNumberMode) {
      queue.push(" ");
      queue.push("#");
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
    clearError();
  };

  const restartTransmission = () => {
    setCurrentIndex(-1);
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

  useEffect(() => {
    if (
      !isPlaying ||
      currentIndex < 0 ||
      currentIndex >= transmissionQueue.length
    ) {
      return;
    }

    const char = transmissionQueue[currentIndex];

    if (char === " ") return;

    if (lastBlinkIndexRef.current === currentIndex) return;

    lastBlinkIndexRef.current = currentIndex;
    setBlinkOn(true);

    const blinkDuration = Math.min(180, getDelay(speedLevel) * 0.35);

    const timeout = setTimeout(() => {
      setBlinkOn(false);
    }, blinkDuration);

    return () => clearTimeout(timeout);
  }, [currentIndex, isPlaying, transmissionQueue, speedLevel]);

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

  const calculateAccuracy = (original: string, user: string) => {
    const normalizedOriginal = decodeSpecialGroups(
      original.toUpperCase()
    ).replace(/\s+/g, "");
    const normalizedUser = user.toUpperCase().replace(/\s+/g, "");

    if (normalizedOriginal.length === 0) return 100;
    if (normalizedUser.length === 0) return 0;

    const levenshteinDistance = (a: string, b: string): number => {
      const dp: number[][] = Array(a.length + 1)
        .fill(null)
        .map(() => Array(b.length + 1).fill(0));

      for (let i = 0; i <= a.length; i++) dp[i][0] = i;
      for (let j = 0; j <= b.length; j++) dp[0][j] = j;

      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          if (a[i - 1] === b[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1];
          } else {
            dp[i][j] =
              1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
          }
        }
      }

      return dp[a.length][b.length];
    };

    const isSubstring = normalizedOriginal.includes(normalizedUser);
    if (isSubstring) {
      const substringAccuracy =
        (normalizedUser.length / normalizedOriginal.length) * 100;
      return Math.round(substringAccuracy);
    }

    const distance = levenshteinDistance(normalizedOriginal, normalizedUser);
    const maxLength = Math.max(
      normalizedOriginal.length,
      normalizedUser.length
    );
    const similarity = 1 - distance / maxLength;
    const accuracy = similarity * 100;

    return Math.round(Math.max(0, accuracy));
  };

  const currentChar =
    currentIndex >= 0 && currentIndex < transmissionQueue.length
      ? transmissionQueue[currentIndex]
      : " ";

  const isTransmittingChar =
    isPlaying &&
    currentIndex >= 0 &&
    currentIndex < transmissionQueue.length &&
    transmissionQueue[currentIndex] !== " ";
  const currentSignal = GET_CHAR_MAPPING(currentChar);
  const transmittedText = transmissionQueue.join("").replace(/#/g, "NUM ");

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); }
        }
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hint-badge {
          animation: float 1s ease-in-out infinite;
        }
        .listening-button {
          animation: glow 2s ease-in-out infinite;
        }
        .result-card {
          animation: slideInFromBottom 0.5s ease-out;
        }
        .fade-enter {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>

      <VoiceGuideModal
        open={showVoiceGuide}
        onAccept={acceptVoiceGuide}
        onCancel={cancelVoiceGuide}
      />

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-slate-200 w-full flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>

        <div className="flex flex-col w-full mb-6 space-y-4">
          <div className="flex justify-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {!isPlaying ? (
              <>
                <button
                  onClick={() => startPractice("short")}
                  className="flex-1 px-4 py-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-xs font-bold text-slate-600 flex flex-col items-center space-y-1 hover:scale-105 active:scale-95"
                >
                  <i className="fas fa-bolt text-amber-500 text-lg"></i>
                  <span>Short</span>
                </button>
                <button
                  onClick={() => startPractice("long")}
                  className="flex-1 px-4 py-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-xs font-bold text-slate-600 flex flex-col items-center space-y-1 hover:scale-105 active:scale-95"
                >
                  <i className="fas fa-anchor text-blue-500 text-lg"></i>
                  <span>Message</span>
                </button>
                <button
                  onClick={() => startPractice("drill")}
                  className="flex-1 px-4 py-3 bg-blue-600 shadow-md rounded-xl transition-all text-xs font-black text-white flex flex-col items-center space-y-1 hover:bg-blue-700 hover:scale-105 active:scale-95"
                >
                  <i className="fas fa-shield-halved text-lg"></i>
                  <span>40x40</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsPlaying(false)}
                className="flex-1 px-6 py-3 bg-red-500 text-white shadow-lg rounded-xl transition-all text-xs font-black flex items-center justify-center space-x-2"
                style={{
                  animation: "glow 1s ease-in-out infinite",
                }}
              >
                <i className="fas fa-stop"></i>
                <span>ABORT</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setShowHints(!showHints)}
              className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                showHints
                  ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm scale-105"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:scale-105"
              } active:scale-95`}
            >
              <i className={`fas ${showHints ? "fa-eye" : "fa-eye-slash"}`}></i>
              <span className="text-xs font-black uppercase tracking-wider">
                {showHints ? "Hints ON" : "Hints OFF"}
              </span>
            </button>

            {speechSupported && (
              <button
                onClick={toggleVoiceInput}
                disabled={!canStartVoiceInput || isFinished}
                className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                  isListening
                    ? "bg-red-50 border-red-300 text-red-700 shadow-sm listening-button"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:scale-105"
                } ${
                  !canStartVoiceInput || isFinished
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } active:scale-95`}
                aria-pressed={isListening}
                aria-label="Toggle voice input"
              >
                <i
                  className={`fas fa-microphone ${
                    isListening ? "animate-pulse" : ""
                  }`}
                ></i>
                <span className="text-xs font-black uppercase tracking-wider">
                  {isListening ? "Tap to Stop" : "Voice Input"}
                </span>
              </button>
            )}

            <div className="w-full sm:w-auto flex flex-col items-center sm:items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Speed: {speedLevel}%
              </span>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={speedLevel}
                onChange={(e) => setSpeedLevel(parseInt(e.target.value))}
                className="w-full sm:w-32 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none transition-all hover:accent-blue-700"
              />
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center py-6">
          {isPlaying && showHints && currentChar !== " " && (
            <div className="absolute -top-4 bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white text-white w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-2xl z-20 hint-badge">
              {currentChar === "#" ? "NUM" : currentChar}
            </div>
          )}

          <Signalman
            leftPos={currentSignal.left}
            rightPos={currentSignal.right}
            size={Math.min(window.innerWidth - 100, 360)}
          />

          <div className="mt-8 flex flex-col items-center w-full max-w-md px-4">
            <div className="flex justify-between w-full text-[9px] uppercase font-black text-slate-500 tracking-wider mb-2">
              <span className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-100 ${
                    blinkOn
                      ? "bg-red-500 scale-150"
                      : isPlaying
                      ? "bg-green-500"
                      : "bg-slate-300"
                  }`}
                  style={{
                    boxShadow: blinkOn
                      ? "0 0 12px rgba(239, 68, 68, 0.9)"
                      : "none",
                  }}
                ></span>

                <span>
                  {isTransmittingChar
                    ? "Transmitting..."
                    : isPlaying
                    ? "Waiting"
                    : transmissionQueue.length > 0
                    ? "Ready"
                    : "READY"}
                </span>
              </span>
              <span>
                {transmissionQueue.length > 0
                  ? `${currentIndex + 1} / ${transmissionQueue.length}`
                  : "READY"}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 shadow-md"
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

      {phrase && !isPlaying && currentIndex < transmissionQueue.length - 1 && (
        <div className="w-full bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 fade-enter">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors">
              <i className="fas fa-satellite-dish text-blue-600"></i>
            </div>
            <span className="text-xl">Transmission Controls</span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => setIsPlaying(true)}
              className="group text-green-600 font-bold hover:text-green-700 transition-all flex items-center justify-center space-x-3 px-6 py-3 rounded-2xl hover:bg-green-50 active:scale-95 hover:scale-105 border-2 border-green-200"
            >
              <i className="fas fa-play"></i>
              <span>Resume Transmission</span>
            </button>
            <button
              onClick={restartTransmission}
              className="group text-blue-600 font-bold hover:text-blue-700 transition-all flex items-center justify-center space-x-3 px-6 py-3 rounded-2xl hover:bg-blue-50 active:scale-95 hover:scale-105 border-2 border-blue-200"
              title="Restart transmission from the beginning"
            >
              <i className="fas fa-redo"></i>
              <span>Restart Transmission</span>
            </button>
          </div>
        </div>
      )}

      {phrase && !isPlaying && (
        <div className="w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 fade-enter">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors">
                <i className="fas fa-keyboard"></i>
              </div>
              <span>Decode Transcription</span>
            </h3>
            {isFinished && (
              <div
                className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  calculateAccuracy(phrase, userInput) > 85
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "bg-orange-100 text-orange-700 shadow-sm"
                }`}
              >
                {calculateAccuracy(phrase, userInput)}% Accuracy
              </div>
            )}
          </div>

          {isListening && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl transition-all hover:shadow-md">
              <div className="flex items-center space-x-3 mb-2">
                <div className="relative">
                  <i className="fas fa-microphone text-red-600 animate-pulse text-lg"></i>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                </div>
                <span className="text-sm font-black text-red-700">
                  🎙️ RECORDING - Tap button to stop
                </span>
              </div>
              {interimTranscript && (
                <div className="mt-2 p-2 bg-white/70 rounded-lg">
                  <p className="text-xs text-slate-600 italic">
                    Listening: {interimTranscript}...
                  </p>
                </div>
              )}
            </div>
          )}

          {voiceError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <i className="fas fa-exclamation-circle text-red-600 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-700 mb-1">
                    Voice Input Error
                  </p>
                  <p className="text-xs text-red-600">{voiceError}</p>
                </div>
              </div>
            </div>
          )}

          <textarea
            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono text-xl uppercase placeholder:text-slate-300 shadow-inner hover:border-slate-200"
            rows={4}
            placeholder="Type or speak your decoded message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isFinished}
          />

          <div className="mt-8 flex flex-col md:flex-row justify-end items-center gap-6">
            {!isFinished ? (
              <button
                onClick={handleSubmit}
                className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:from-slate-800 hover:to-slate-700 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center space-x-3 hover:scale-105"
              >
                <span>Submit Log</span>
                <i className="fas fa-paper-plane"></i>
              </button>
            ) : (
              <div className="flex flex-col w-full space-y-3">
                <div className="flex flex-col items-end bg-green-50 p-6 rounded-[1.5rem] border border-green-100 w-full overflow-hidden shadow-sm result-card hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">
                    Original Secure Message
                  </p>
                  <p className="text-lg font-mono font-bold text-green-800 break-all leading-relaxed">
                    {decodeSpecialGroups(phrase)}
                  </p>
                </div>
                <div className="flex flex-col items-end bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100 w-full overflow-hidden shadow-sm result-card hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
                    Transmitted Signal
                  </p>
                  <p className="text-lg font-mono font-bold text-blue-800 break-all leading-relaxed">
                    {transmittedText}
                  </p>
                </div>
                <div className="flex flex-col items-end bg-purple-50 p-6 rounded-[1.5rem] border border-purple-100 w-full overflow-hidden shadow-sm result-card hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-2">
                    Your Answer
                  </p>
                  <p className="text-lg font-mono font-bold text-purple-800 break-all leading-relaxed">
                    {userInput || "(Empty)"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeMode;
