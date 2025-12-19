import { useRef, useCallback } from "react";
import { Delete, ArrowRight } from "lucide-react";
import { hapticFeedback } from "@tma.js/sdk-react";

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
}

const keys = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
];

function triggerKeyHaptic() {
  if (hapticFeedback.impactOccurred.isAvailable()) {
    hapticFeedback.impactOccurred("light");
  }
}

export function NumericKeypad({ onKeyPress, onBackspace, onSubmit, isLoading }: NumericKeypadProps) {
  const backspaceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backspaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchActiveRef = useRef(false);

  const handleKeyPress = (digit: string) => {
    triggerKeyHaptic();
    onKeyPress(digit);
  };

  const handleBackspace = useCallback(() => {
    triggerKeyHaptic();
    onBackspace();
  }, [onBackspace]);

  const startContinuousBackspace = useCallback(() => {
    // First, do one immediate backspace
    handleBackspace();

    // After 400ms delay, start continuous deletion
    backspaceTimeoutRef.current = setTimeout(() => {
      backspaceIntervalRef.current = setInterval(() => {
        triggerKeyHaptic();
        onBackspace();
      }, 80); // Delete every 80ms while held
    }, 400);
  }, [onBackspace, handleBackspace]);

  const stopContinuousBackspace = useCallback(() => {
    if (backspaceTimeoutRef.current) {
      clearTimeout(backspaceTimeoutRef.current);
      backspaceTimeoutRef.current = null;
    }
    if (backspaceIntervalRef.current) {
      clearInterval(backspaceIntervalRef.current);
      backspaceIntervalRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    isTouchActiveRef.current = true;
    startContinuousBackspace();
  }, [startContinuousBackspace]);

  const handleTouchEnd = useCallback(() => {
    stopContinuousBackspace();
    // Reset touch flag after a small delay to prevent mouse events
    setTimeout(() => {
      isTouchActiveRef.current = false;
    }, 100);
  }, [stopContinuousBackspace]);

  const handleMouseDown = useCallback(() => {
    // Ignore mouse events if touch was just used
    if (isTouchActiveRef.current) return;
    startContinuousBackspace();
  }, [startContinuousBackspace]);

  const handleMouseUp = useCallback(() => {
    if (isTouchActiveRef.current) return;
    stopContinuousBackspace();
  }, [stopContinuousBackspace]);

  const handleSubmit = () => {
    if (onSubmit && !isLoading) {
      triggerKeyHaptic();
      onSubmit();
    }
  };

  return (
    <div className="w-full px-2 pb-2">
      {/* Submit button row */}
      {onSubmit && (
        <div className="flex justify-end mb-2 p-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="size-14 rounded-full bg-primary flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight size={24} className="text-white" />
            )}
          </button>
        </div>
      )}

      {/* Main grid 3x3 */}
      <div className="grid grid-cols-3 gap-1">
        {keys.map(({ digit, letters }) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleKeyPress(digit)}
            className="h-14 rounded-xl bg-stone-100 active:bg-stone-200 flex flex-col items-center justify-center transition-colors"
          >
            <span className="text-2xl font-medium text-stone-900">{digit}</span>
            {letters && (
              <span className="text-[10px] text-stone-400 tracking-widest -mt-1">{letters}</span>
            )}
          </button>
        ))}
      </div>

      {/* Bottom row: empty, 0, backspace */}
      <div className="grid grid-cols-3 gap-1 mt-1">
        {/* Empty space */}
        <div className="h-14" />

        {/* Zero key */}
        <button
          type="button"
          onClick={() => handleKeyPress("0")}
          className="h-14 rounded-xl bg-stone-100 active:bg-stone-200 flex flex-col items-center justify-center transition-colors"
        >
          <span className="text-2xl font-medium text-stone-900">0</span>
          <span className="text-[10px] text-stone-400 -mt-1">+</span>
        </button>

        {/* Backspace */}
        <button
          type="button"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="h-14 rounded-xl bg-stone-100 active:bg-stone-200 flex items-center justify-center transition-colors select-none"
        >
          <Delete size={24} className="text-stone-700" />
        </button>
      </div>
    </div>
  );
}
