'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const FILTERS = ['자유게시판', '질문게시판', '스터디모집'];

export default function CommunityWriteForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('스터디모집');
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    // 최대 2장 제한
    const selectedFiles = Array.from(files).slice(0, 2);
    const imageUrls = selectedFiles.map((file) => URL.createObjectURL(file));

    setPreviewImages((prev) => {
      const combined = [...prev, ...imageUrls];

      return combined.slice(0, 2);
    });
    e.target.value = '';
  };

  return (
    <div className="mx-auto w-full max-w-[1020px]">
      {/* back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 cursor-pointer flex items-center gap-2 text-sm font-medium text-[#4B5563]"
      >
        <Image src="/icons/back.svg" alt="back" width={16} height={16} />
        목록으로 돌아가기
      </button>

      {/* form */}
      <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm">
        {/* title */}
        <h2 className="mb-8 text-2xl font-bold text-[#1E293B]">게시글 작성</h2>

        {/* category */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            게시판 선택 *
          </label>

          <div className="grid grid-cols-3 gap-3">
            {FILTERS.map((filter) => {
              const isActive = activeTab === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveTab(filter)}
                  className={`h-12 rounded-2xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#2F5DAA] text-white'
                      : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#4B5563]'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* title input */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            제목 *
          </label>

          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="h-12 w-full rounded-xl border border-[#E2E8F0] px-4 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* question board */}
        {activeTab === '질문게시판' && (
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              과목 *
            </label>

            <div className="flex h-12 items-center justify-between rounded-xl border border-[#E2E8F0] px-4">
              <span className="text-sm text-[#9CA3AF]">과목을 선택하세요</span>

              <Image
                src="/icons/chevronDownIcon.svg"
                alt="down"
                width={18}
                height={18}
              />
            </div>
          </div>
        )}

        {/* study board */}
        {activeTab === '스터디모집' && (
          <>
            {/* subject */}
            <div className="mb-8">
              <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
                과목 *
              </label>

              <div className="flex h-12 items-center justify-between rounded-xl border border-[#E2E8F0] px-4">
                <span className="text-sm text-[#9CA3AF]">
                  과목을 선택하세요
                </span>

                <Image
                  src="/icons/chevronDownIcon.svg"
                  alt="down"
                  width={18}
                  height={18}
                />
              </div>
            </div>

            {/* recruit */}
            <div className="mb-8">
              <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
                모집 정원 *
              </label>

              <input
                type="text"
                placeholder="모집 정원을 입력하세요"
                className="h-12 w-full rounded-xl border border-[#E2E8F0] px-4 text-sm outline-none placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* description */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-sm font-semibold text-[#1E293B]">
                  설명 *
                </label>

                <span className="text-xs text-[#64748B]">0/20</span>
              </div>

              <textarea
                placeholder="스터디 설명을 입력하세요 (최대 20자)"
                className="h-[120px] w-full resize-none rounded-xl border border-[#E2E8F0] px-4 py-4 text-sm outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
          </>
        )}

        {/* content */}
        {activeTab !== '스터디모집' && (
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              내용 *
            </label>

            <textarea
              placeholder="내용을 입력하세요"
              className="h-[220px] w-full resize-none rounded-xl border border-[#E2E8F0] px-4 py-4 text-sm outline-none placeholder:text-[#9CA3AF]"
            />
          </div>
        )}

        {/* image upload */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            이미지 첨부 (선택)
            <span className="ml-2 text-xs font-medium text-[#94A3B8]">
              최대 2장까지 업로드 가능
            </span>
          </label>

          <div
            onClick={() => {
              if (previewImages.length >= 2) {
                toast.error('사진은 최대 2장까지 업로드 가능합니다.');

                return;
              }

              fileInputRef.current?.click();
            }}
            className="flex h-[150px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC]"
          >
            {previewImages.length === 0 ? (
              <>
                <Image
                  src="/icons/image.svg"
                  alt="upload"
                  width={28}
                  height={28}
                />

                <span className="mt-1 ml-4 text-sm text-[#64748B]">
                  이미지를 선택하세요
                </span>
              </>
            ) : (
              <div className="flex w-full items-center justify-center gap-4">
                {previewImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-[110px] w-[110px] overflow-hidden rounded-xl border border-[#E2E8F0]"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();

                        e.stopPropagation();

                        setPreviewImages((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                      }}
                      className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white transition hover:bg-black/80"
                    >
                      ✕
                    </button>
                    <Image
                      src={image}
                      alt={`preview-${index}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}

                {previewImages.length < 2 && (
                  <span className="text-xs text-[#94A3B8]">
                    이미지를 추가하려면 다시 클릭하세요
                  </span>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="h-12 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#4B5563]"
          >
            취소
          </button>

          <button
            type="button"
            className="h-12 flex-1 rounded-xl bg-[#B7C8EB] text-sm font-semibold text-white"
          >
            작성 완료
          </button>
        </div>
      </div>
    </div>
  );
}
