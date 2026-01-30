import { useState, useEffect, useRef } from "react";

interface VoiceInputHook {
  isListening: boolean;
  speechSupported: boolean;
  interimTranscript: string;
  voiceError: string;
  startRecording: () => void;
  stopRecording: () => void;
  toggleVoiceInput: (canStart: boolean, onShowGuide: () => void) => void;
  clearError: () => void;
}

export const useVoiceInput = (
  onTranscript: (text: string) => void
): VoiceInputHook => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");

  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);
  const lastProcessedIndexRef = useRef(-1);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("🎤 Recognition started");
      setVoiceError("");
      lastProcessedIndexRef.current = -1;
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (i <= lastProcessedIndexRef.current) {
          continue;
        }

        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcript;
          lastProcessedIndexRef.current = i;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        const processed = processTranscript(final);
        onTranscript(processed);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone permission denied. Please allow microphone access."
        );
        setIsListening(false);
        isActiveRef.current = false;
      } else if (event.error === "no-speech") {
        console.log("No speech detected, restarting...");
        if (isActiveRef.current) {
          setTimeout(() => {
            if (isActiveRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log("Could not restart after no-speech");
              }
            }
          }, 100);
        }
      } else if (event.error !== "aborted") {
        setVoiceError(`Recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("Recognition ended");

      if (isActiveRef.current) {
        setTimeout(() => {
          if (isActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              console.log("🔄 Recognition restarted");
            } catch (e) {
              console.log("Could not restart recognition:", e);
            }
          }
        }, 100);
      } else {
        setIsListening(false);
        setInterimTranscript("");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isActiveRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
    };
  }, [onTranscript]);

  const processTranscript = (text: string) => {
    let result = text.toUpperCase().trim();

    // Special symbol mapping
    const symbolMap: Record<string, string> = {
      KN: "(",
      KK: ")",
      AAA: ".",
      "TRIPLE A": ".",
      MIM: ",",
      DU: "-",
      XE: "/",
    };

    // Phonetic letter corrections (common speech-to-text misinterpretations)
    const phoneticMap: Record<string, string> = {
      YOU: "U",
      ARE: "R",
      SEE: "C",
      BE: "B",
      WHY: "Y",
      EYE: "I",
      OH: "O",
      OKAY: "K",
      KAY: "K",
      JAY: "J",
      AYE: "I",
      TEA: "T",
      PEA: "P",
      QUEUE: "Q",
      EX: "X",
    };

    // Number word mapping (for spoken numbers)
    const numberWordMap: Record<string, string> = {
      ZERO: "0",
      ONE: "1",
      TWO: "2",
      THREE: "3",
      FOUR: "4",
      FOR: "4",
      FIVE: "5",
      SIX: "6",
      SEVEN: "7",
      SVN: "7",
      EIGHT: "8",
      ATE: "8",
      NINE: "9",
    };

    const words = result.split(/\s+/);
    let processed = "";
    let i = 0;
    let inNumberMode = false;

    while (i < words.length) {
      const word = words[i];

      // Check for NUM indicator
      if (word === "NUM" || word === "NUMBER") {
        if (inNumberMode) {
          // Closing NUM - exit number mode
          inNumberMode = false;
        } else {
          // Opening NUM - enter number mode
          inNumberMode = true;
        }
        i++;
        continue;
      }

      // If in number mode, try to convert word to digit
      if (inNumberMode && numberWordMap[word]) {
        processed += numberWordMap[word];
        i++;
        continue;
      }

      // Check for phonetic corrections
      if (phoneticMap[word]) {
        processed += phoneticMap[word];
        i++;
        continue;
      }

      // Check for special symbols
      if (symbolMap[word]) {
        processed += symbolMap[word];
        i++;
        continue;
      }

      // Check for space commands
      if (word === "NEXT" || word === "SPACE") {
        processed += " ";
        i++;
        continue;
      }

      // Single letter
      if (word.length === 1 && /[A-Z]/.test(word)) {
        processed += word;
        i++;
        continue;
      }

      // Multi-letter word - extract individual letters
      for (const char of word) {
        if (/[A-Z]/.test(char)) {
          processed += char;
        }
      }
      i++;
    }

    return processed;
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      setVoiceError("Speech recognition not supported");
      return;
    }

    try {
      isActiveRef.current = true;
      lastProcessedIndexRef.current = -1;
      recognitionRef.current.start();
      setIsListening(true);
      setVoiceError("");
      setInterimTranscript("");
    } catch (e: any) {
      if (e.message && e.message.includes("already started")) {
        setIsListening(true);
        isActiveRef.current = true;
      } else {
        setVoiceError("Failed to start recording: " + e.message);
        console.error("Start error:", e);
      }
    }
  };

  const stopRecording = () => {
    isActiveRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Stop error:", e);
      }
    }

    setIsListening(false);
    setInterimTranscript("");
  };

  const toggleVoiceInput = (canStart: boolean, onShowGuide: () => void) => {
    if (!speechSupported) {
      setVoiceError("Speech recognition not supported in this browser");
      return;
    }

    if (!canStart) return;

    const hasSeenGuide = localStorage.getItem("voiceGuideSeen");

    if (isListening) {
      stopRecording();
    } else {
      if (!hasSeenGuide) {
        onShowGuide();
        return;
      }
      startRecording();
    }
  };

  const clearError = () => {
    setVoiceError("");
  };

  return {
    isListening,
    speechSupported,
    interimTranscript,
    voiceError,
    startRecording,
    stopRecording,
    toggleVoiceInput,
    clearError,
  };
};

interface VoiceGuideModalProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export const VoiceGuideModal: React.FC<VoiceGuideModalProps> = ({
  open,
  onAccept,
  onCancel,
}) => {
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => acceptButtonRef.current?.focus(), 100);
    }
  }, [open]);

  const handleClose = (accepted: boolean) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      if (accepted) {
        onAccept();
      } else {
        onCancel();
      }
    }, 300);
  };

  if (!open && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isClosing
          ? "bg-black/0 backdrop-blur-none"
          : "bg-black/60 backdrop-blur-sm"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-guide-title"
    >
      <div
        className={`bg-white max-w-md w-full mx-4 p-6 rounded-3xl shadow-2xl border border-slate-200 transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{
          animation: !isClosing
            ? "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "slideDown 0.3s ease-in",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes slideDown {
            from {
              transform: translateY(0);
              opacity: 1;
            }
            to {
              transform: translateY(30px);
              opacity: 0;
            }
          }
          @keyframes pulse-icon {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
          .voice-guide-icon {
            animation: pulse-icon 2s ease-in-out infinite;
          }
        `}</style>

        <h2
          id="voice-guide-title"
          className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2"
        >
          <span className="text-2xl voice-guide-icon inline-block">🎙️</span>
          Voice Input - Tap Mode
        </h2>

        

        <ul className="text-sm text-slate-600 space-y-2 mb-4">
          <li className="flex items-start gap-2 hover:text-slate-800 transition-colors">
            <span className="text-blue-500 font-bold mt-0.5">•</span>
            <span>Microphone permission is required to use voice input</span>
          </li>

          <li className="flex items-start gap-2 hover:text-slate-800 transition-colors">
            <span className="text-green-500 font-bold mt-0.5">•</span>
            <span>Say “next” to add a space while dictating</span>
          </li>

          <li className="flex items-start gap-2 hover:text-slate-800 transition-colors">
            <span className="text-amber-500 font-bold mt-0.5">•</span>
            <span>Say “number” to insert a numeric symbol</span>
          </li>

          <li className="flex items-start gap-2 hover:text-slate-800 transition-colors">
            <span className="text-purple-500 font-bold mt-0.5">•</span>
            <span>
              Works best when you speak at a steady, moderate pace (around
              70–85%)
            </span>
          </li>

          <li className="flex items-start gap-2 hover:text-slate-800 transition-colors">
            <span className="text-rose-500 font-bold mt-0.5">•</span>
            <span>Try speaking slightly faster to avoid frequent beeps</span>
          </li>
        </ul>

        <div
          className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl text-[11px] font-mono text-slate-700 mb-4 border border-slate-200 shadow-inner"
          aria-label="Supported voice commands"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div>
                <span className="text-blue-600 font-bold">NEXT</span> → space
              </div>
              <div>
                <span className="text-blue-600 font-bold">KN</span> → (
              </div>
              <div>
                <span className="text-blue-600 font-bold">KK</span> → )
              </div>
              <div>
                <span className="text-blue-600 font-bold">AAA</span> → .
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-blue-600 font-bold">MIM</span> → ,
              </div>
              <div>
                <span className="text-blue-600 font-bold">DU</span> → -
              </div>
              <div>
                <span className="text-blue-600 font-bold">XE</span> → /
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-300 text-center text-xs text-slate-500">
            Speak letters A-Z clearly between commands
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleClose(false)}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            ref={acceptButtonRef}
            onClick={() => handleClose(true)}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl"
            aria-label="Accept voice rules and start voice input"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
