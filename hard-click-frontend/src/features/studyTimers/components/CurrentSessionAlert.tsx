'use client';

interface CurrentSessionAlertProps {
  startedAt: string;
  onResume: () => void;
  onEnd: () => void;
}

export default function CurrentSessionAlert({
  startedAt,
  onResume,
  onEnd,
}: CurrentSessionAlertProps) {
  const startTime = new Date(startedAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">{startTime}</span>부터 순공시간이 측정 중입니다.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onResume}
          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          이어하기
        </button>
        <button
          onClick={onEnd}
          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          종료
        </button>
      </div>
    </div>
  );
}
