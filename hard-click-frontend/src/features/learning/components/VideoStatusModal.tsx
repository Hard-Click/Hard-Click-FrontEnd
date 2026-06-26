'use client';

interface VideoStatusModalProps {
  /** BE 코드: 403=비공개(L002)·수강권 없음(L003), 404=영상 없음(L001)·재생 URL 없음(L005), 401=로그인, 500=오류.
   *  구체 문구는 services가 message로 내려 preset description을 덮어쓴다. */
  status: number;
  message?: string;
  onClose: () => void;
}

const PRESETS: Record<number, { title: string; description: string }> = {
  401: { title: '로그인 필요', description: '이 영상을 시청하려면 로그인이 필요해요.' },
  403: {
    title: '시청 권한 없음',
    description: '수강신청 또는 공개된 강의에서만 시청할 수 있어요.',
  },
  404: { title: '영상 오류', description: '존재하지 않는 영상입니다.' },
  500: { title: '영상 오류', description: '영상을 불러오지 못했습니다.' },
};

export default function VideoStatusModal({ status, message, onClose }: VideoStatusModalProps) {
  const preset = PRESETS[status] ?? PRESETS[500];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-[448px] h-[240px] bg-white rounded-2xl relative"
        style={{
          boxShadow:
            '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 className="absolute left-8 top-8 w-[384px] h-8 text-2xl font-bold leading-8 text-[#1F2937] text-center">
          {preset.title}
        </h2>
        <p className="absolute left-8 top-[92px] w-[384px] text-base leading-6 text-[#4B5563] text-center">
          {message || preset.description}
        </p>
        <div className="absolute left-8 top-40 w-[384px]">
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
