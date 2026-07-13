interface AiCoachBannerProps {
  comment: string;
}

export function AiCoachBanner({ comment }: AiCoachBannerProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] p-5">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"
            fill="currentColor"
          />
          <path
            d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"
            fill="currentColor"
          />
        </svg>
      </span>
      <div>
        <h2 className="text-sm font-bold text-[#1D4ED8]">AI 학습 코치</h2>
        <p className="mt-1 text-sm text-[#334155]">{comment}</p>
      </div>
    </div>
  );
}
