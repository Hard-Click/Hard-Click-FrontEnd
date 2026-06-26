// 라우트 데이터 로딩 중 보여줄 UI (Suspense 기반). 서버가 먼저 이 화면을 흘려보낸다.
export default function Loading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-[#64748B]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2F5DAA]" />
      <p className="mt-4 text-sm">불러오는 중입니다…</p>
    </div>
  );
}
