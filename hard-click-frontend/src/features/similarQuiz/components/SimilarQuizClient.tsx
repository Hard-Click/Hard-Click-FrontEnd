'use client';

import { useState } from 'react';
import SimilarQuizTakeClient from './SimilarQuizTakeClient';
import SimilarQuizResult from './SimilarQuizResult';
import type { SimilarQuizDetail, SimilarQuizSubmitResult } from '../types';

/**
 * 유사퀴즈 오케스트레이터 (client) — 응시 → 제출 → 결과(해설)를 **같은 화면 상태전환**으로.
 * 기존 퀴즈는 응시/해설이 2개 라우트였지만, 유사퀴즈는 재응시·재조회가 없어 1개 라우트에서
 * 제출 응답(해설 포함)만으로 결과를 렌더한다.
 */
export default function SimilarQuizClient({
  detail,
}: {
  detail: SimilarQuizDetail;
}) {
  const [result, setResult] = useState<SimilarQuizSubmitResult | null>(null);

  if (result) {
    return (
      <SimilarQuizResult
        courseId={detail.courseId}
        courseTitle={detail.courseTitle}
        title={detail.title}
        result={result}
      />
    );
  }

  return <SimilarQuizTakeClient detail={detail} onComplete={setResult} />;
}
