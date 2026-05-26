'use client';

interface StudyTimerDisplayProps {
  seconds: number;
  isRunning: boolean;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function StudyTimerDisplay({ seconds, isRunning }: StudyTimerDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-500">순공시간</span>
      <span
        className={`text-2xl font-bold tabular-nums tracking-widest transition-colors ${
          isRunning ? 'text-blue-600' : 'text-gray-700'
        }`}
      >
        {formatTime(seconds)}
      </span>
    </div>
  );
}
