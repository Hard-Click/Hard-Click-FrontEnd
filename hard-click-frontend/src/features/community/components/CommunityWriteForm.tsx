'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { COMMUNITY_ERRORS } from '../constants/errorMessages';
import LoadingModal from '@/components/ui/loadingModal';
import { createPostAction, updatePostAction } from '../actions';
import { BOARD_TYPE_VALUE } from '../types';
import type { SubjectItem } from '../types';

const FILTERS = ['자유게시판', '질문게시판', '스터디모집'];

/** 기존(서버) 이미지 vs 새로 선택한 파일을 한 배열로 관리 — 예전엔 previewImages(문자열)·selectedFiles(File)를
 *  따로 관리해서, 앞쪽에 기존 이미지가 섞이면 두 배열의 인덱스가 어긋나 엉뚱한 이미지가 삭제됐다. */
type ImageEntry =
  | { kind: 'existing'; url: string }
  | { kind: 'new'; file: File; previewUrl: string };

interface CommunityWriteFormProps {
  mode?: 'create' | 'edit';
  initialCategory?: string;
  initialTitle?: string;
  initialContent?: string;
  initialFileUrls?: string[];
  /** 수정 시 기존 과목 enum 코드 (예: 'KO_READING') — 드롭다운 초기 선택값 */
  initialSubject?: string;
  postId?: number;
  /** 과목 목록은 서버(Server Component)에서 조회해 props로 전달받는다 */
  subjects: SubjectItem[];
}

export default function CommunityWriteForm({
  mode = 'create',
  initialCategory = '자유게시판',
  initialTitle = '',
  initialContent = '',
  initialFileUrls = [],
  initialSubject = '',
  postId,
  subjects,
}: CommunityWriteFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [images, setImages] = useState<ImageEntry[]>(
    initialFileUrls.map((url) => ({ kind: 'existing', url }))
  );

  const [title, setTitle] = useState(initialTitle);
  const [titleError, setTitleError] = useState('');
  const [content, setContent] = useState(initialContent);
  const [contentError, setContentError] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [subjectError, setSubjectError] = useState('');
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [recruit, setRecruit] = useState('');
  const [recruitError, setRecruitError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [focusedErrorField, setFocusedErrorField] = useState<string | null>(
    null
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const recruitRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TAB_TO_LIST: Record<string, string> = {
    자유게시판: '자유게시판',
    질문게시판: '질문게시판',
    스터디모집: '스터디게시판',
  };

  const isFormValid =
    activeTab === '자유게시판'
      ? title.trim() !== '' && content.trim() !== ''
      : activeTab === '질문게시판'
      ? title.trim() !== '' && subject !== '' && content.trim() !== ''
      : title.trim() !== '' &&
        subject !== '' &&
        recruit.trim() !== '' &&
        description.trim() !== '';

  const handleTabChange = (filter: string) => {
    if (mode === 'edit') return;
    setActiveTab(filter);
    setTitle('');
    setContent('');
    setSubject('');
    setRecruit('');
    setDescription('');
    setTitleError('');
    setContentError('');
    setSubjectError('');
    setRecruitError('');
    setDescriptionError('');
    setFocusedErrorField(null);
    setImages([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
    const MAX_SIZE = 5 * 1024 * 1024;
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(COMMUNITY_ERRORS.F001);
        e.target.value = '';
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error(COMMUNITY_ERRORS.F002);
        e.target.value = '';
        return;
      }
    }
    const newFiles = Array.from(files).slice(0, 2);
    setImages((prev) =>
      [
        ...prev,
        ...newFiles.map(
          (f): ImageEntry => ({
            kind: 'new',
            file: f,
            previewUrl: URL.createObjectURL(f),
          })
        ),
      ].slice(0, 2)
    );
    e.target.value = '';
  };

  const handleSubmit = () => {
    let isValid = true;
    let firstInvalid: string | null = null;

    if (!title.trim()) {
      setTitleError(COMMUNITY_ERRORS.TITLE_REQUIRED);
      isValid = false;
      if (!firstInvalid) firstInvalid = 'title';
    }
    if (
      (activeTab === '질문게시판' || activeTab === '스터디모집') &&
      !subject
    ) {
      setSubjectError(COMMUNITY_ERRORS.P001);
      isValid = false;
      if (!firstInvalid) firstInvalid = 'subject';
    }
    if (activeTab === '스터디모집') {
      if (!recruit.trim()) {
        setRecruitError(COMMUNITY_ERRORS.RECRUIT_REQUIRED);
        isValid = false;
        if (!firstInvalid) firstInvalid = 'recruit';
      }
      if (!description.trim()) {
        setDescriptionError(COMMUNITY_ERRORS.DESCRIPTION_REQUIRED);
        isValid = false;
        if (!firstInvalid) firstInvalid = 'description';
      }
    }
    if (activeTab !== '스터디모집' && !content.trim()) {
      setContentError(COMMUNITY_ERRORS.CONTENT_REQUIRED);
      isValid = false;
      if (!firstInvalid) firstInvalid = 'content';
    }

    if (!isValid) {
      setFocusedErrorField(firstInvalid);
      if (firstInvalid === 'title') titleRef.current?.focus();
      if (firstInvalid === 'content') contentRef.current?.focus();
      if (firstInvalid === 'recruit') recruitRef.current?.focus();
      if (firstInvalid === 'description') descriptionRef.current?.focus();
      return;
    }
    setFocusedErrorField(null);
    setIsConfirmOpen(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    const boardType = BOARD_TYPE_VALUE[activeTab];
    // 백엔드는 과목을 enum 코드(예: MATH_1)로 받음 (질문/스터디 게시판에서 필수)
    const subjectName =
      (activeTab === '질문게시판' || activeTab === '스터디모집') && subject
        ? subject
        : undefined;
    if (mode === 'edit' && postId) {
      const keepImageUrls = images
        .filter((img): img is Extract<ImageEntry, { kind: 'existing' }> => img.kind === 'existing')
        .map((img) => img.url);
      const newFiles = images
        .filter((img): img is Extract<ImageEntry, { kind: 'new' }> => img.kind === 'new')
        .map((img) => img.file);
      const fd = new FormData();
      fd.append('data', JSON.stringify({
        title,
        content,
        ...(subjectName !== undefined ? { subject: subjectName } : {}),
        keepImageUrls,
      }));
      newFiles.forEach((f) => fd.append('files', f));
      const result = await updatePostAction(postId, fd);
      setIsSubmitting(false);
      if (!result.success) {
        toast.error(result.message || '게시글 수정에 실패했습니다.');
        return;
      }
      toast.success('게시글이 수정되었습니다.');
      router.push(`/community/${postId}`);
      router.refresh();
    } else {
      const fd = new FormData();
      if (boardType === 'STUDY') {
        fd.append('data', JSON.stringify({
          boardType,
          title,
          content: description,
          ...(subjectName !== undefined ? { subject: subjectName } : {}),
          maxCount: Number(recruit),
        }));
      } else {
        fd.append('data', JSON.stringify({
          boardType,
          title,
          content,
          ...(subjectName !== undefined ? { subject: subjectName } : {}),
        }));
        images
          .filter((img): img is Extract<ImageEntry, { kind: 'new' }> => img.kind === 'new')
          .forEach((img) => fd.append('files', img.file));
      }
      const result = await createPostAction(fd);
      setIsSubmitting(false);
      if (!result.success) {
        toast.error(result.message || '게시글 등록에 실패했습니다.');
        return;
      }
      toast.success('게시글이 등록되었습니다.');
      router.push(`/community?tab=${activeTab}`);
      router.refresh();
    }
  };

  const ErrorMsg = ({ error }: { error: string }) => (
    <div className="mt-1 flex h-5 items-center gap-1 text-sm text-[#B91C1C]">
      {error && (
        <>
          <Image src="/icons/error.svg" alt="error" width={14} height={14} />
          {error}
        </>
      )}
    </div>
  );

  return (
    <>
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[448px] rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-center text-xl font-bold text-[#1F2937]">
              {mode === 'edit' ? '게시글 수정' : '게시글 등록'}
            </h2>
            <p className="mt-3 text-center text-sm text-[#4B5563]">
              {mode === 'edit'
                ? '해당 게시글을 수정하시겠습니까?'
                : '해당 게시글을 등록하시겠습니까?'}
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmedSubmit}
                className="h-12 flex-1 rounded-xl bg-[#2F5DAA] text-sm font-semibold text-white hover:bg-[#1D3E75]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubmitting && (
        <LoadingModal
          title={
            mode === 'edit' ? '게시글 수정 중입니다' : '게시글 등록 중입니다'
          }
          description="잠시만 기다려주세요...."
        />
      )}

      <div className="mx-auto w-full max-w-[1020px]">
        <button
          type="button"
          onClick={() => router.push('/community')}
          className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-medium text-[#4B5563]"
        >
          <Image src="/icons/back.svg" alt="back" width={16} height={16} />
          목록으로 돌아가기
        </button>

        <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <h2 className="mb-8 text-2xl font-bold text-[#1E293B]">
            {mode === 'edit' ? '게시글 수정' : '게시글 작성'}
          </h2>

          {/* 게시판 선택 */}
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
                    onClick={() => handleTabChange(filter)}
                    disabled={mode === 'edit'}
                    className={`h-12 rounded-2xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#2F5DAA] text-white'
                        : mode === 'edit'
                        ? 'cursor-not-allowed border border-[#E2E8F0] bg-[#F1F5F9] text-[#9CA3AF]'
                        : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#4B5563]'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 제목 */}
          <div className="mb-4">
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              제목 *
            </label>
            <input
              ref={titleRef}
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!e.target.value.trim()) {
                  setTitleError(COMMUNITY_ERRORS.TITLE_REQUIRED);
                  setFocusedErrorField('title');
                } else {
                  setTitleError('');
                  if (focusedErrorField === 'title') setFocusedErrorField(null);
                }
              }}
              className={`h-12 w-full rounded-xl border px-4 text-sm outline-none placeholder:text-[#9CA3AF] ${
                focusedErrorField === 'title'
                  ? 'border-[#B91C1C]'
                  : 'border-[#E2E8F0]'
              }`}
            />
            <ErrorMsg error={titleError} />
          </div>

          {/* 과목 — 질문게시판 + 스터디모집 */}
          {(activeTab === '질문게시판' || activeTab === '스터디모집') && (
            <div className="mb-4">
              <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
                과목 *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSubjectOpen((prev) => !prev)}
                  className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-sm ${
                    subject ? 'text-[#1E293B]' : 'text-[#9CA3AF]'
                  } ${
                    focusedErrorField === 'subject'
                      ? 'border-[#B91C1C]'
                      : 'border-[#E2E8F0]'
                  }`}
                >
                  <span>{subjects.find((s) => s.code === subject)?.name || '과목을 선택하세요'}</span>
                  <Image
                    src="/icons/chevronDownIcon.svg"
                    alt="down"
                    width={18}
                    height={18}
                    className={`transition-transform ${
                      isSubjectOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isSubjectOpen && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
                    {subjects.map((s) => (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => {
                          setSubject(s.code);
                          setSubjectError('');
                          setFocusedErrorField(null);
                          setIsSubjectOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#F8FAFC] ${
                          subject === s.code
                            ? 'bg-[#EFF6FF] font-semibold text-[#2F5DAA]'
                            : 'text-[#374151]'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <ErrorMsg error={subjectError} />
            </div>
          )}

          {/* 모집 정원 + 설명 — 스터디모집 전용 */}
          {activeTab === '스터디모집' && (
            <>
              <div className="mb-4">
                <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
                  모집 정원 *
                </label>
                <input
                  ref={recruitRef}
                  type="number"
                  placeholder="모집 정원을 입력하세요"
                  value={recruit}
                  onChange={(e) => {
                    setRecruit(e.target.value);
                    if (!e.target.value.trim()) {
                      setRecruitError(COMMUNITY_ERRORS.RECRUIT_REQUIRED);
                      setFocusedErrorField('recruit');
                    } else {
                      setRecruitError('');
                      if (focusedErrorField === 'recruit')
                        setFocusedErrorField(null);
                    }
                  }}
                  className={`h-12 w-full rounded-xl border px-4 text-sm outline-none placeholder:text-[#9CA3AF] ${
                    focusedErrorField === 'recruit'
                      ? 'border-[#B91C1C]'
                      : 'border-[#E2E8F0]'
                  }`}
                />
                <ErrorMsg error={recruitError} />
              </div>

              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-[#1E293B]">
                    설명 *
                  </label>
                  <span className="text-xs text-[#64748B]">
                    {description.length}/20
                  </span>
                </div>
                <textarea
                  ref={descriptionRef}
                  placeholder="스터디 설명을 입력하세요 (최대 20자)"
                  value={description}
                  maxLength={20}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (!e.target.value.trim()) {
                      setDescriptionError(
                        COMMUNITY_ERRORS.DESCRIPTION_REQUIRED
                      );
                      setFocusedErrorField('description');
                    } else {
                      setDescriptionError('');
                      if (focusedErrorField === 'description')
                        setFocusedErrorField(null);
                    }
                  }}
                  className={`h-[120px] w-full resize-none rounded-xl border px-4 py-4 text-sm outline-none placeholder:text-[#9CA3AF] ${
                    focusedErrorField === 'description'
                      ? 'border-[#B91C1C]'
                      : 'border-[#E2E8F0]'
                  }`}
                />
                <ErrorMsg error={descriptionError} />
              </div>
            </>
          )}

          {/* 내용 — 스터디모집 제외 */}
          {activeTab !== '스터디모집' && (
            <div className="mb-4">
              <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
                내용 *
              </label>
              <textarea
                ref={contentRef}
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (!e.target.value.trim()) {
                    setContentError(COMMUNITY_ERRORS.CONTENT_REQUIRED);
                    setFocusedErrorField('content');
                  } else {
                    setContentError('');
                    if (focusedErrorField === 'content')
                      setFocusedErrorField(null);
                  }
                }}
                className={`h-[220px] w-full resize-none rounded-xl border px-4 py-4 text-sm outline-none placeholder:text-[#9CA3AF] ${
                  focusedErrorField === 'content'
                    ? 'border-[#B91C1C]'
                    : 'border-[#E2E8F0]'
                }`}
              />
              <ErrorMsg error={contentError} />
            </div>
          )}

          {/* 이미지 첨부 — 스터디모집 제외 */}
          {activeTab !== '스터디모집' && (
            <div className="mb-8">
              <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
                이미지 첨부 (선택)
                <span className="ml-2 text-xs font-medium text-[#94A3B8]">
                  최대 2장까지 업로드 가능
                </span>
              </label>
              <div
                onClick={() => {
                  if (images.length >= 2) {
                    toast.error(COMMUNITY_ERRORS.P002);
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                className="flex h-[150px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC]"
              >
                {images.length === 0 ? (
                  <>
                    <Image
                      src="/icons/Image.svg"
                      alt="upload"
                      width={28}
                      height={28}
                    />
                    <span className="ml-4 mt-1 text-sm text-[#64748B]">
                      이미지를 선택하세요
                    </span>
                  </>
                ) : (
                  <div className="flex w-full items-center justify-center gap-4">
                    {images.map((img, index) => (
                      <div
                        key={img.kind === 'existing' ? img.url : img.previewUrl}
                        className="relative h-[110px] w-[110px] overflow-hidden rounded-xl border border-[#E2E8F0]"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white transition hover:bg-black/80"
                        >
                          ✕
                        </button>
                        <Image
                          src={img.kind === 'existing' ? img.url : img.previewUrl}
                          alt={`preview-${index}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {images.length < 2 && (
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
          )}

          {/* 버튼 */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/community')}
              className="h-12 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#4B5563]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`h-12 flex-1 rounded-xl text-sm font-semibold text-white transition ${
                isFormValid
                  ? 'bg-[#2F5DAA] opacity-100'
                  : 'bg-[#2F5DAA] opacity-50'
              }`}
            >
              {mode === 'edit' ? '수정 완료' : '작성 완료'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
