'use client';

import { useEffect } from 'react';
import Image from 'next/image';

interface FocusModeOverlayProps {
  seconds: number;
  /** null = 오늘 누적 조회 실패(0과 구분) */
  todaySeconds: number | null;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(' : ');
}

export default function FocusModeOverlay({
  seconds,
  todaySeconds,
  isPaused,
  onPause,
  onResume,
  onEnd,
}: FocusModeOverlayProps) {
  // ESC 키로 종료 (UA-P1-146)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEnd();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnd]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex w-full max-w-lg flex-col items-center gap-6 px-6">
        {/* 메인 타이머 */}
        <div className="flex flex-col items-center gap-2">
          <span className="whitespace-nowrap font-mono text-6xl font-bold tracking-widest text-white">
            {formatTime(seconds)}
          </span>
          <p className="text-lg text-white">학습 중...</p>
          <p className="text-sm text-gray-400">집중하세요</p>
        </div>

        {/* 구분선 */}
        <div className="w-full border-t border-gray-700" />

        {/* 오늘 총 학습 시간 */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs text-gray-500">오늘 총 학습 시간</p>
          {/* null=오늘 누적 조회 실패 — 0으로 보여주면 '오늘 공부 안 함'과 구분이 안 된다(§0.1④) */}
          <span className="font-mono text-2xl font-semibold text-white">
            {todaySeconds === null ? (
              <span className="text-base text-gray-400">집계 불러오기 실패</span>
            ) : (
              formatTime(todaySeconds)
            )}
          </span>
        </div>

        {/* 집중 모드 활성화 표시 */}
        <p className="text-xs text-gray-600">집중 모드 활성화</p>

        {/* 버튼 */}
        <div className="flex gap-3">
          {/* 일시정지 / 재개 버튼 */}
          <button
            onClick={isPaused ? onResume : onPause}
            className="flex items-center gap-2 rounded-lg bg-gray-800 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700"
          >
            {isPaused ? (
              <>
                <Image src="/icons/play.svg" alt="재개" width={16} height={16} />
                재개
              </>
            ) : (
              <>
                <span className="flex gap-0.5">
                  <span className="h-4 w-1 rounded-sm bg-white" />
                  <span className="h-4 w-1 rounded-sm bg-white" />
                </span>
                일시정지
              </>
            )}
          </button>

          {/* 종료 버튼 */}
          <button
            onClick={onEnd}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700"
          >
            <span className="h-4 w-4 rounded-sm bg-white" />
            종료
          </button>
        </div>

        <p className="text-xs text-gray-600">ESC 키를 눌러 학습을 종료할 수 있습니다</p>
      </div>
    </div>
  );
}
