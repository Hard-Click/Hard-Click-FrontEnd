import Image from 'next/image';
import Link from 'next/link';

/**
 * 유사퀴즈 안내(빈) 화면 — 상호작용 없음(Link만) → Server Component.
 *  - variant="empty":   오답이 0개라 BE가 유사 문제를 생성하지 않은 경우 안내(정상 빈상태). 실패는 error.tsx가 처리.
 *  - variant="invalid": 진입 파라미터가 없거나 잘못된 경우 (캘린더에서 진입 유도).
 */
export default function SimilarQuizEmptyState({
  variant,
  courseId,
}: {
  variant: 'empty' | 'invalid';
  courseId?: number;
}) {
  const empty = variant === 'empty';
  const title = empty ? '유사 문제가 없어요' : '유사 문제에 접근할 수 없어요';
  const message = empty
    ? '아직 틀린 문제가 없어 유사 문제를 만들지 않았어요. 계속 잘 하고 있어요!'
    : '유사 문제는 캘린더의 학습 일정에서 진입할 수 있어요.';

  return (
    <div className="mx-auto max-w-[640px] px-8 py-20 text-center">
      <Image
        src="/icons/emptyStateIcon.svg"
        alt=""
        width={64}
        height={64}
        className="mx-auto"
      />
      <h1 className="mt-6 text-2xl font-bold text-[#1F2937]">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-[#4B5563]">{message}</p>

      <div className="mt-8 flex justify-center gap-3">
        {empty && courseId ? (
          <Link
            href={`/learning/${courseId}`}
            className="flex h-12 items-center justify-center rounded-[10px] bg-[#2F5DAA] px-6 text-base font-semibold text-white transition hover:bg-[#274C8B]"
          >
            다시 학습하기
          </Link>
        ) : null}
        {/* 캘린더 경로는 곽시윤 #876 진입점 확정 시 조정(현재 /schedule). */}
        <Link
          href="/schedule"
          className="flex h-12 items-center justify-center rounded-[10px] border-2 border-[#E2E8F0] px-6 text-base font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC]"
        >
          캘린더로 가기
        </Link>
      </div>
    </div>
  );
}
