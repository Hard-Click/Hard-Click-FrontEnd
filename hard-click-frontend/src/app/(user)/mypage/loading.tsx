export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[#4B5563]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2F5DAA]" />
        <p className="text-sm">불러오는 중...</p>
      </div>
    </div>
  );
}
