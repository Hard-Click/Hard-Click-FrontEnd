'use client';

interface HeartbeatSaveIndicatorProps {
  lastSavedAt: Date | null;
  isSaving: boolean;
}

export default function HeartbeatSaveIndicator({
  lastSavedAt,
  isSaving,
}: HeartbeatSaveIndicatorProps) {
  if (!lastSavedAt && !isSaving) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-gray-400">
      {isSaving ? (
        <>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
          <span>저장 중...</span>
        </>
      ) : (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span>
            {lastSavedAt
              ? `${lastSavedAt.getHours().toString().padStart(2, '0')}:${lastSavedAt.getMinutes().toString().padStart(2, '0')} 자동 저장됨`
              : ''}
          </span>
        </>
      )}
    </div>
  );
}
