import Image from 'next/image';

/**
 * 퀴즈 목록 빈 상태 — 공용 empty-state 형식(아이콘 + 문구, 가운데 정렬).
 * PostEmptyState 등 다른 피처 빈 상태와 동일 스타일. 강의명 카드 안에 들어가므로 별도 테두리 없음.
 */
export default function QuizEmptyState({
  message = '등록된 퀴즈가 없습니다',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Image
        src="/icons/emptyStateIcon.svg"
        alt=""
        width={64}
        height={64}
        className="mb-4"
      />
      <p className="text-base font-medium text-[#4B5563]">{message}</p>
    </div>
  );
}
