interface AiCoachBannerProps {
  comment: string;
}

export function AiCoachBanner({ comment }: AiCoachBannerProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#93B4E0] bg-[#EFF6FF] p-5">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2F5DAA] text-white"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
          <path d="M13 5C14.26 10.74 18.74 10.74 20 12 18.74 13.26 14.26 13.26 13 19 11.74 13.26 7.26 13.26 6 12 7.26 10.74 11.74 10.74 13 5Z" />
          <path d="M20 4C20.54 6.46 22.46 6.46 23 7 22.46 7.54 20.54 7.54 20 10 19.46 7.54 17.54 7.54 17 7 17.54 6.46 19.46 6.46 20 4Z" />
          <path d="M7 16.5C7.45 18.55 9.05 18.55 9.5 19 9.05 19.45 7.45 19.45 7 21.5 6.55 19.45 4.95 19.45 4.5 19 4.95 18.55 6.55 18.55 7 16.5Z" />
        </svg>
      </span>
      <div>
        <h2 className="text-sm font-bold text-[#2F5DAA]">AI 학습 코치</h2>
        <p className="mt-1 text-sm text-[#334155]">{comment}</p>
      </div>
    </div>
  );
}
