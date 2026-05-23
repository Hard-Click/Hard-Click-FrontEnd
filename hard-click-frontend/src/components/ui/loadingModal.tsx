'use client';

import Spinner from './spinner';

interface LoadingModalProps {
  title: string;
  description: string;
}

export default function LoadingModal({
  title,
  description,
}: LoadingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-[520px] rounded-[28px] bg-white px-8 py-12 shadow-xl">
        {/* spinner */}
        <div className="mb-10 flex justify-center">
          <Spinner />
        </div>

        {/* title */}
        <h2 className="mb-4 text-center text-[28px] font-bold text-[#1F2937]">
          {title}
        </h2>

        {/* description */}
        <p className="text-center text-base text-[#6B7280]">{description}</p>
      </div>
    </div>
  );
}
