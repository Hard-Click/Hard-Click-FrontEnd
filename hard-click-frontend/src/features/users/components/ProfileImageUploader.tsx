import Image from 'next/image';
import type { RefObject } from 'react';

interface ImageStepProps {
  imagePreview: string;
  onUploadClick: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (file: File | undefined) => void;
  canSave: boolean;
  error: string | null;
  onBack: () => void;
  onSave: () => void;
}

/* ──────────────── Step 3a: 프로필 이미지 변경 ──────────────── */
export function ImageStep({
  imagePreview,
  onUploadClick,
  fileInputRef,
  onFileChange,
  canSave,
  error,
  onBack,
  onSave,
}: ImageStepProps) {
  return (
    <>
      <h3 className="text-lg font-semibold leading-7 text-[#1F2937]">
        프로필 이미지 변경
      </h3>

      <div className="mt-4 flex flex-col items-center">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[rgba(47,93,170,0.1)]">
          {imagePreview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imagePreview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src="/icons/profileAvatarIcon.svg"
              alt=""
              width={64}
              height={64}
            />
          )}
        </div>
        <button
          type="button"
          onClick={onUploadClick}
          className="mt-4 h-12 rounded-[10px] bg-[#2F5DAA] px-6 text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
        >
          이미지 업로드
        </button>
        <p className="mt-2 text-sm leading-5 text-[#4B5563]">
          jpeg, jpg, png 형식 / 최대 5MB
        </p>
        <div className="mt-2 h-5">
          {error && (
            <p className="flex items-center gap-1 text-sm text-[#DC2626]">
              <Image src="/icons/error.svg" alt="" width={16} height={16} />
              {error}
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          hidden
          onChange={(e) => onFileChange(e.target.files?.[0])}
        />
      </div>

      <div className="mt-6 flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
        >
          뒤로가기
        </button>
        <button
          type="button"
          onClick={onSave}
          className={`h-12 flex-1 rounded-[10px] text-base font-semibold transition-colors ${
            canSave
              ? 'bg-[#2F5DAA] text-white hover:bg-[#1D3E75]'
              : 'bg-[#E2E8F0] text-[#9CA3AF]'
          }`}
        >
          저장
        </button>
      </div>
    </>
  );
}
