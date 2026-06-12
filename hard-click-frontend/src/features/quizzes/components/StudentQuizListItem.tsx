import Link from 'next/link';
import WeekBadge from './WeekBadge';
import type { StudentQuizItem } from '../types';

/** 완료 배지 — 체크 */
const CheckIcon = (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
/** 미응시 배지 — 시계 */
const ClockIcon = (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
/** 해설 보기 — 문서 */
const FileIcon = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);
/** 응시하기 — 클립보드 */
const ClipboardIcon = (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="3" width="8" height="4" rx="1" />
    <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
    <path d="m9 13 2 2 3-3" />
  </svg>
);

/**
 * 수강생 퀴즈 1행 — 주차 배지 + 제목/상태 + (응시: 점수·해설보기 / 미응시: 응시하기).
 * 점수 색은 강사 점수현황과 동일한 scoreBucket 재사용. 재응시 1회라 응시 후엔 해설보기만.
 */
export default function StudentQuizListItem({
  item,
}: {
  item: StudentQuizItem;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E2E8F0] p-5">
      {/* 왼쪽: 주차 + 제목/상태 + 메타 */}
      <div className="flex items-center gap-4">
        <WeekBadge week={item.week} size="md" />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-[#1F2937]">{item.title}</h3>
            {item.attempted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#16A34A1a] px-2.5 py-0.5 text-sm font-semibold text-[#16A34A]">
                {CheckIcon} 완료
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-sm font-semibold text-[#64748B]">
                {ClockIcon} 미응시
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            총 {item.questionCount}문제
            {item.attempted && item.attemptedDate
              ? ` · 응시일: ${item.attemptedDate.replaceAll('-', '.')}`
              : ''}
          </p>
        </div>
      </div>

      {/* 오른쪽: 점수 + 버튼 */}
      <div className="flex shrink-0 items-center gap-8">
        {item.attempted && item.score !== null && (
          <div className="text-center">
            <p className="text-sm text-[#64748B]">점수</p>
            <p className="text-2xl font-bold leading-tight text-[#2F5DAA]">
              {item.score}
            </p>
          </div>
        )}
        {item.attempted ? (
          <Link
            href={`/quizzes/${item.courseId}/${item.quizId}/review`}
            className="inline-flex h-11 w-32 items-center justify-center gap-1.5 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white transition hover:bg-[#274C8B]"
          >
            {FileIcon} 해설 보기
          </Link>
        ) : (
          <Link
            href={`/quizzes/${item.courseId}/${item.quizId}`}
            className="inline-flex h-11 w-32 items-center justify-center gap-1.5 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white transition hover:bg-[#274C8B]"
          >
            {ClipboardIcon} 응시하기
          </Link>
        )}
      </div>
    </div>
  );
}
