'use client';

// TODO: UA-P0-108 — OT 미리보기 영상 재생 구현
// 현재는 stub. 상세 페이지 구현 시 previewVideoUrl 연동 필요.

interface Props {
  isOpen: boolean;
  courseTitle: string;
  previewVideoUrl?: string;
  onClose: () => void;
}

export default function PreviewVideoModal({ isOpen, courseTitle, previewVideoUrl, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-[#1F2937] font-semibold text-lg line-clamp-1">{courseTitle}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#4B5563]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="aspect-video bg-gray-900 flex items-center justify-center">
          {previewVideoUrl ? (
            <video src={previewVideoUrl} controls className="w-full h-full" />
          ) : (
            <p className="text-white/60 text-sm">미리보기 영상을 준비 중입니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
