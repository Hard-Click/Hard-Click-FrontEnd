import { SCHEDULE_LEGEND } from '@/features/courses/subjects';

export function ScheduleLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {SCHEDULE_LEGEND.map((item) => (
        <span key={item.category} className="flex items-center gap-1.5 text-sm text-[#475569]">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color.light }}
          />
          {item.label}
        </span>
      ))}
      {/* 못 한 학습(지난 미완료). 캘린더 검정 막대와 1:1. */}
      <span className="flex items-center gap-1.5 text-sm text-[#475569]">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#1E293B' }} />
        못함
      </span>
    </div>
  );
}
