'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import QuizQuestionCard from '@/features/quizzes/components/QuizQuestionCard';
import QuizNavigator from '@/features/quizzes/components/QuizNavigator';
import QuizSubmitModal from '@/features/quizzes/components/QuizSubmitModal';
import ConfirmModal from '@/components/ui/confirmModal';
import { useQuizLeaveGuard } from '@/features/quizzes/hooks/useQuizLeaveGuard';
import { submitSimilarQuizAction } from '../actions';
import type { SimilarQuizDetail, SimilarQuizSubmitResult } from '../types';

const PAGE_SIZE = 5;

/** 미응시 경고 — 느낌표 */
const AlertIcon = (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#B91C1C"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);
const ArrowLeft = (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const ArrowRight = (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/**
 * 유사퀴즈 응시 (client) — QuizTakeClient 복제, **제출부만 교체**.
 * 기존 퀴즈: 제출 성공 → 목록 이동. 유사퀴즈: 제출 성공 → 응답(해설 포함)을 onComplete로 부모에
 * 넘겨 같은 화면에서 결과(해설)로 전환. 채점은 submitSimilarQuizAction(서버).
 * 응시 UI(문제카드·네비·제출모달)는 기존 퀴즈 표시용 컴포넌트를 그대로 재사용.
 */
export default function SimilarQuizTakeClient({
  detail,
  onComplete,
}: {
  detail: SimilarQuizDetail;
  onComplete: (result: SimilarQuizSubmitResult) => void;
}) {
  const router = useRouter();
  const { questions } = detail;
  const total = questions.length;

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [navPage, setNavPage] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // 응시 중 이탈 방지 — 뒤로가기(확인 모달)·새로고침/닫기(브라우저 경고). 헤더 이탈은 layout에서 숨김.
  const { showConfirm, requestStay, confirmLeave } = useQuizLeaveGuard(
    !submitted,
  );

  const answeredCount = questions.filter(
    (q) => answers[q.questionId] !== undefined,
  ).length;
  const unansweredCount = total - answeredCount;
  const allAnswered = unansweredCount === 0;
  const progressPct = total ? Math.round((answeredCount / total) * 100) : 0;
  const currentQuestion = questions[current];
  const isLast = current === total - 1;
  const firstUnanswered = questions.findIndex(
    (q) => answers[q.questionId] === undefined,
  );

  // ── 문제별 풀이 시간 측정 (AI 복습 추천용, BE 요청) — 화면엔 표시 안 함 ──────────
  // 정규 퀴즈(QuizTakeClient)와 동일 방식. performance.now()(단조 시계, 기기 시간 변경에 안전)로
  // 현재 문제에 머문 시간을 누적한다.
  const timeSpentRef = useRef<Record<number, number>>({}); // questionId → 누적 ms
  const segmentStartRef = useRef<number | null>(null); // 현재 구간 시작(ms), null=일시정지(탭 이탈)
  const currentRef = useRef(0); // current 미러 — 비동기 가시성 핸들러의 stale 클로저 방지

  // 현재 문제에 머문 구간 시간을 맵에 누적하고 구간을 재시작. 일시정지(null) 중엔 no-op.
  const flushSegment = useCallback(() => {
    if (segmentStartRef.current == null) return;
    const now = performance.now();
    const qid = questions[currentRef.current]?.questionId;
    if (qid != null) {
      timeSpentRef.current[qid] =
        (timeSpentRef.current[qid] ?? 0) + (now - segmentStartRef.current);
    }
    segmentStartRef.current = now;
  }, [questions]);

  // 진입 시 첫 문제 타이머 시작 + 탭 이탈/복귀 일시정지·재개(자리 비운 시간 제외).
  useEffect(() => {
    segmentStartRef.current = performance.now();
    const onVisibility = () => {
      if (document.hidden) {
        flushSegment(); // 이탈 직전까지 누적
        segmentStartRef.current = null; // 일시정지
      } else {
        segmentStartRef.current = performance.now(); // 복귀 — 재개
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () =>
      document.removeEventListener('visibilitychange', onVisibility);
  }, [flushSegment]);

  const goTo = (i: number) => {
    if (i < 0 || i >= total || i === current) return;
    flushSegment(); // 떠나는 문제 시간 누적
    currentRef.current = i; // 미러 먼저 갱신(가시성 핸들러 정합)
    segmentStartRef.current = performance.now(); // 새 문제 타이머 시작
    setCurrent(i);
    setNavPage(Math.floor(i / PAGE_SIZE)); // 네비 페이지를 현재 문항에 동기화
  };

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setSubmitAttempted(true);
      if (firstUnanswered >= 0) goTo(firstUnanswered); // 첫 미응시로 점프
      return;
    }
    setShowModal(true);
  };

  const handleConfirmSubmit = async () => {
    flushSegment(); // 제출 시점까지 현재 문제 시간 마저 누적
    // 누적 ms → 초 정수 반올림 (문제별). 미측정·상한 처리는 Server Action과 서버 몫.
    const timeSpentByQuestion: Record<number, number> = {};
    for (const qid in timeSpentRef.current) {
      timeSpentByQuestion[Number(qid)] = Math.round(
        timeSpentRef.current[qid] / 1000,
      );
    }
    setSubmitting(true);
    try {
      const res = await submitSimilarQuizAction(
        detail.similarQuizId,
        answers,
        timeSpentByQuestion,
      );
      if (!res.success || !res.result) {
        toast.error(res.message ?? '제출에 실패했습니다.');
        return;
      }
      setShowModal(false);
      setSubmitted(true); // 이탈 가드 해제 — 결과(해설) 전환을 막지 않도록
      toast.success(`채점 완료! 점수 ${res.result.score}점`);
      // 기존 퀴즈와 달리 목록으로 이동하지 않고 같은 화면에서 해설(결과)로 전환.
      onComplete(res.result);
    } catch {
      // 액션이 인프라 레벨에서 reject되어도 사용자 피드백·상태 복구 보장(모달 영구 비활성 방지).
      toast.error('제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-[896px] flex-col justify-center px-8 py-6">
      {/* 헤더 — 강의명·제목·진행 통계·진행바 */}
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
        <p className="text-sm text-[#4B5563]">{detail.courseTitle}</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1F2937]">
          {detail.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-[#E2E8F0] pt-4">
          <div className="shrink-0">
            <p className="whitespace-nowrap text-sm text-[#4B5563]">현재 문항</p>
            <p className="whitespace-nowrap text-xl font-bold text-[#2F5DAA]">
              {current + 1} / {total}
            </p>
          </div>
          <div className="shrink-0">
            <p className="whitespace-nowrap text-sm text-[#4B5563]">응시 완료</p>
            <p className="whitespace-nowrap text-xl font-bold text-[#16A34A]">
              {answeredCount}문항
            </p>
          </div>
          <div className="shrink-0">
            <p className="whitespace-nowrap text-sm text-[#4B5563]">미응시</p>
            <p className="whitespace-nowrap text-xl font-bold text-[#F59E0B]">
              {unansweredCount}문항
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
          <div
            className="h-full rounded-full bg-[#2F5DAA] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* 문제 카드 */}
      <div className="mt-4">
        <QuizQuestionCard
          index={current}
          question={currentQuestion}
          selectedIndex={answers[currentQuestion.questionId]}
          onSelect={(optIdx) =>
            setAnswers((a) => ({
              ...a,
              [currentQuestion.questionId]: optIdx,
            }))
          }
        />
      </div>

      {/* 문항 바로가기 */}
      <div className="mt-4">
        <QuizNavigator
          total={total}
          current={current}
          isAnswered={(i) => answers[questions[i].questionId] !== undefined}
          navPage={navPage}
          pageSize={PAGE_SIZE}
          onJump={goTo}
          onPrevPage={() => setNavPage((p) => Math.max(0, p - 1))}
          onNextPage={() =>
            setNavPage((p) => Math.min(Math.ceil(total / PAGE_SIZE) - 1, p + 1))
          }
        />
      </div>

      {/* 이전 / 다음 / 제출 */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="flex h-12 items-center gap-1.5 rounded-[10px] border-2 border-[#E2E8F0] px-6 text-base font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {ArrowLeft} 이전 문제
        </button>
        {isLast || allAnswered ? (
          <button
            type="button"
            onClick={handleSubmitClick}
            className="h-12 flex-1 rounded-[10px] bg-[#16A34A] text-base font-semibold text-white transition hover:bg-[#15803D]"
          >
            제출하기
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white transition hover:bg-[#274C8B]"
          >
            다음 문제 {ArrowRight}
          </button>
        )}
      </div>

      {/* 미응시 경고 (제출 시도 후) */}
      {submitAttempted && unansweredCount > 0 && (
        <div className="mt-4 flex gap-3 rounded-[20px] border border-[#FCA5A5] bg-[#FEF2F2] p-4">
          <span className="mt-0.5 shrink-0">{AlertIcon}</span>
          <div>
            <p className="text-sm font-semibold text-[#B91C1C]">
              미응시 문항이 있습니다
            </p>
            <p className="mt-1 text-sm text-[#4B5563]">
              {unansweredCount}개의 문항에 답하지 않았습니다. 모든 문항에 답한 후
              제출해주세요.
            </p>
          </div>
        </div>
      )}

      {/* 제출 확인 모달 */}
      {showModal && (
        <QuizSubmitModal
          totalCount={total}
          answeredCount={answeredCount}
          unansweredCount={unansweredCount}
          submitting={submitting}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirmSubmit}
        />
      )}

      {/* 뒤로가기 이탈 확인 (헤더는 layout에서 숨김, 새로고침/닫기는 브라우저 경고) */}
      {showConfirm && (
        <ConfirmModal
          title="정말 나가시겠어요?"
          description={
            '나가면 지금까지 푼 답이 모두 사라지고\n처음부터 다시 풀어야 해요.'
          }
          cancelText="계속 풀기"
          confirmText="나가기"
          confirmVariant="danger"
          onCancel={requestStay}
          onConfirm={() => {
            confirmLeave();
            router.push('/quizzes');
          }}
        />
      )}
    </div>
  );
}
