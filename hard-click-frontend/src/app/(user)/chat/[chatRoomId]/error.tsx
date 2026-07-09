'use client';

import { useEffect } from 'react';

/**
 * 채팅방 에러 UI (Error Boundary) — getChatRoomServer/getChatHistoryServer 실패 시.
 * (방 없음·BE 500·네트워크 등. 서버 조회는 실패를 숨기지 않고 throw → 여기서 잡는다)
 * 채팅 page와 같은 프레임 안에서, 다른 라우트 error.tsx와 동일한 문구/버튼 톤으로 표시.
 */
export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-[calc(100dvh-64px)] overflow-hidden bg-[#F8FAFC] px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto flex h-full max-w-[1120px] items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white px-8 shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl font-bold text-[#1F2937]">
            채팅방을 불러오지 못했습니다.
          </h2>
          <p className="text-sm text-[#4B5563]">잠시 후 다시 시도해주세요.</p>
          <button
            type="button"
            onClick={reset}
            className="h-11 rounded-[10px] bg-[#2F5DAA] px-6 text-base font-semibold text-white transition-colors hover:bg-[#1D3E75]"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}
