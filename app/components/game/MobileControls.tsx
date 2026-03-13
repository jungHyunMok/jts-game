'use client';
import React from 'react';

interface Props {
  onPressKey: (key: string) => void;
  onReleaseKey: (key: string) => void;
}

interface BtnProps {
  dir: string;
  label: string;
  onPress: (k: string) => void;
  onRelease: (k: string) => void;
  className?: string;
}

function DPadButton({ dir, label, onPress, onRelease, className = '' }: BtnProps) {
  return (
    <button
      className={`flex items-center justify-center w-14 h-14 rounded-xl bg-white/30 active:bg-white/60 border-2 border-white/50 text-white text-xl font-bold select-none touch-none ${className}`}
      onTouchStart={(e) => { e.preventDefault(); onPress(dir); }}
      onTouchEnd={(e) => { e.preventDefault(); onRelease(dir); }}
      onMouseDown={() => onPress(dir)}
      onMouseUp={() => onRelease(dir)}
      onMouseLeave={() => onRelease(dir)}
      aria-label={label}
    >
      {label}
    </button>
  );
}

export default function MobileControls({ onPressKey, onReleaseKey }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 mt-4 select-none">
      <DPadButton dir="up" label="▲" onPress={onPressKey} onRelease={onReleaseKey} />
      <div className="flex gap-1">
        <DPadButton dir="left" label="◀" onPress={onPressKey} onRelease={onReleaseKey} />
        <div className="w-14 h-14" />
        <DPadButton dir="right" label="▶" onPress={onPressKey} onRelease={onReleaseKey} />
      </div>
      <DPadButton dir="down" label="▼" onPress={onPressKey} onRelease={onReleaseKey} />
    </div>
  );
}
