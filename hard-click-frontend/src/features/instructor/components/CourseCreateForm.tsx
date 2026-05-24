'use client';

import Image from 'next/image';
import { useState } from 'react';

const SUBJECT_OPTIONS = [
  '국어',
  '수학 1',
  '수학 2',
  '영어',
  '한국사',
  '생명과학 1',
  '화학 1',
  '지구과학 1',
  '물리학 1',
  '확률과 통계',
  '기하',
  '미적분',
];

export default function CourseCreateForm() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState<'FREE' | 'PAID'>('FREE');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [sections, setSections] = useState([
    {
      id: 1,
      title: '',
    },
  ]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      {/* title */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#1E293B]">강의 등록</h1>
        </div>

        <p className="text-base text-[#64748B]">
          새로운 강의를 등록하고 수강생들과 공유하세요.
        </p>
      </div>

      {/* form card */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
        {/* section title */}
        <h2 className="mb-8 text-xl font-bold text-[#1E293B]">기본 정보</h2>

        {/* 강의명 */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            강의명 <span className="text-[#DC2626]">*</span>
          </label>

          <input
            type="text"
            placeholder="강의명을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-14 w-full rounded-2xl border border-[#E2E8F0] px-5 text-base outline-none transition focus:border-[#2F5DAA]"
          />
        </div>

        {/* 과목 */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            과목 <span className="text-[#DC2626]">*</span>
          </label>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-14 w-full rounded-2xl border border-[#E2E8F0] px-5 text-base outline-none transition focus:border-[#2F5DAA]"
          >
            <option value="">과목 선택</option>

            {SUBJECT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* 설명 */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            강의 설명 <span className="text-[#DC2626]">*</span>
          </label>

          <textarea
            placeholder="강의 내용을 상세히 설명해주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[180px] w-full rounded-2xl border border-[#E2E8F0] p-5 text-base outline-none transition focus:border-[#2F5DAA]"
          />
        </div>

        {/* 썸네일 */}
        {/* 썸네일 */}
        <div className="mb-10">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            썸네일 이미지
          </label>

          <div className="flex items-center gap-4">
            <label className="flex h-14 w-fit cursor-pointer items-center gap-2 rounded-2xl border border-[#E2E8F0] px-5 transition hover:bg-[#F8FAFC]">
              <Image
                src="/icons/upload.svg"
                alt="upload"
                width={18}
                height={18}
              />

              <span className="text-sm font-medium text-[#334155]">
                이미지 업로드
              </span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    setThumbnail(file);
                  }
                }}
              />
            </label>

            {thumbnail && (
              <div className="flex h-12 items-center gap-3 rounded-full bg-[#F8FAFC] px-5">
                <p className="max-w-[240px] truncate text-sm text-[#334155]">
                  {thumbnail.name}
                </p>

                <button
                  type="button"
                  onClick={() => setThumbnail(null)}
                  className="text-[#64748B] transition hover:text-[#1E293B]"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <p className="mt-3 text-sm text-[#94A3B8]">
            jpg, png 형식 / 최대 5MB
          </p>
        </div>

        {/* divider */}
        <div className="mb-8 border-t border-[#E2E8F0]" />

        {/* 가격 설정 */}
        <div className="mb-8">
          <h2 className="mb-6 text-xl font-bold text-[#1E293B]">가격 설정</h2>

          {/* radio */}
          <div className="mb-6 flex items-center gap-8">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                checked={priceType === 'FREE'}
                onChange={() => setPriceType('FREE')}
              />

              <span className="text-sm font-medium text-[#1E293B]">
                무료 강의
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                checked={priceType === 'PAID'}
                onChange={() => setPriceType('PAID')}
              />

              <span className="text-sm font-medium text-[#1E293B]">
                유료 강의
              </span>
            </label>
          </div>

          {/* price */}

          {priceType === 'PAID' && (
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
                가격
              </label>

              <div className="flex h-14 w-[220px] items-center rounded-2xl border border-[#E2E8F0] px-5">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-transparent text-base outline-none"
                />

                <span className="text-sm text-[#64748B]">원</span>
              </div>
            </div>
          )}
        </div>
        {/* divider */}
        <div className="mb-8 border-t border-[#E2E8F0]" />

        {/* curriculum */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1E293B]">커리큘럼</h2>

            <button
              type="button"
              onClick={() =>
                setSections((prev) => [
                  ...prev,
                  {
                    id: Date.now(),
                    title: '',
                    lectures: [''],
                  },
                ])
              }
              className="rounded-xl border border-[#2F5DAA] px-4 py-2 text-sm font-semibold text-[#2F5DAA] transition hover:bg-[#EEF4FF]"
            >
              + 섹션 추가
            </button>
          </div>

          <div className="space-y-5">
            {sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="rounded-3xl border border-[#E2E8F0] bg-white p-6"
              >
                {/* section title */}
                <div className="mb-4 flex items-center gap-4">
                  <button type="button" className="text-[#94A3B8] cursor-grab">
                    ☰
                  </button>

                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => {
                      setSections((prev) =>
                        prev.map((item) =>
                          item.id === section.id
                            ? { ...item, title: e.target.value }
                            : item
                        )
                      );
                    }}
                    placeholder={`섹션 ${sectionIndex + 1} 제목`}
                    className="h-11 flex-1 rounded-xl border border-[#E2E8F0] px-4 text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setSections((prev) =>
                        prev.filter((item) => item.id !== section.id)
                      )
                    }
                    className="text-[#EF4444]"
                  >
                    ✕
                  </button>
                </div>

                {/* lectures */}
                <div className="pl-8">
                  <button
                    type="button"
                    className="h-12 w-full rounded-2xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]"
                  >
                    + 강의 영상 추가
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* buttons */}
      <div className="mt-8 flex items-center gap-5">
        <button
          type="button"
          className="h-14 flex-1 rounded-2xl border border-[#E2E8F0] bg-white text-base font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
        >
          취소
        </button>

        <button
          type="button"
          className="h-14 flex-1 rounded-2xl bg-[#2F5DAA] text-base font-semibold text-white transition hover:bg-[#1D3E75]"
        >
          강의 등록
        </button>
      </div>
    </div>
  );
}
