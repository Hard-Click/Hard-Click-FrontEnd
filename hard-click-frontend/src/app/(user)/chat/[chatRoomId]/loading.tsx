/**
 * 채팅방 로딩 UI (Suspense fallback) — 방정보/히스토리 서버 조회 동안 표시.
 * 채팅 page와 같은 프레임(헤더 아래 전체 높이·흰 패널) 안에 공통 스피너를 띄운다.
 * (다른 라우트 loading.tsx와 동일한 스피너·색 톤)
 */
export default function Loading() {
  return (
    <div className="h-[calc(100dvh-64px)] overflow-hidden bg-[#F8FAFC] px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto flex h-full max-w-[1120px] items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center gap-3 text-[#64748B]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2F5DAA]" />
          <p className="text-sm">채팅방을 불러오는 중입니다…</p>
        </div>
      </div>
    </div>
  );
}
