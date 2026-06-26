'use client';

import Link from 'next/link';

interface VideoErrorStateProps {
  status?: number;
  message?: string;
  backHref?: string;
}

const STATUS_PRESET: Record<number, { title: string; description: string }> = {
  401: {
    title: '로그인이 필요합니다',
    description: '이 영상을 시청하려면 로그인 후 이용해주세요.',
  },
  // BE는 비공개 강의(L002)·수강권 없음(L003)을 모두 403으로 내려준다(구체 문구는 message로 덮어씀).
  403: {
    title: '시청 권한이 없습니다',
    description: '수강 신청했거나 공개된 강의의 영상만 시청할 수 있습니다.',
  },
  404: {
    title: '영상을 찾을 수 없습니다',
    description: '요청하신 영상이 존재하지 않거나 삭제되었습니다.',
  },
  500: {
    title: '재생 정보를 불러올 수 없습니다',
    description: '잠시 후 다시 시도해주세요.',
  },
};

export default function VideoErrorState({ status = 500, message, backHref = '/courses' }: VideoErrorStateProps) {
  const preset = STATUS_PRESET[status] ?? STATUS_PRESET[500];
  return (
    <div className="w-full aspect-video bg-black flex flex-col items-center justify-center text-white gap-4 px-4">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold">{preset.title}</h2>
      <p className="text-sm text-white/70 text-center whitespace-pre-line">
        {message || preset.description}
      </p>
      <Link
        href={backHref}
        className="mt-2 h-10 px-4 rounded-lg bg-[#2F5DAA] hover:bg-[#1D3E75] text-sm font-semibold flex items-center"
      >
        강의 목록으로
      </Link>
    </div>
  );
}
