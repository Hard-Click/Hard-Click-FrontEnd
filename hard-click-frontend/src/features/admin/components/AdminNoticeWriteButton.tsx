'use client';

export default function AdminNoticeWriteButton() {
  const handleClick = () => {
    // TODO: 작성 모달 열기 또는 작성 페이지 이동
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-xl bg-[#2F5DAA] px-5 py-2.5 text-m font-semibold text-white transition hover:bg-[#1D3E75]"
    >
      + 공지 작성
    </button>
  );
}
