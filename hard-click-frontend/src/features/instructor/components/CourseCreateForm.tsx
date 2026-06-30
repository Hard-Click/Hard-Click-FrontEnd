'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import DoubleBtnModal from '@/components/ui/doubleButtonModal';
import { useRouter } from 'next/navigation';
import LoadingModal from '@/components/ui/loadingModal';
import { createCourse, updateCourse, uploadCourseThumbnail } from '../services';
import { SUBJECTS, subjectValueById } from '@/features/courses/subjects';
import type { Subject } from '@/features/courses/types';
import { api } from '@/services/api';
import axios from 'axios';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface Lecture {
  id: string;
  file?: File;
  fileName: string;
  duration: string;
}

interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
}

interface CourseDetail {
  courseId?: number;
  title: string;
  description?: string;
  techTags?: string[];
  subjectId?: number;
  priceType: 'FREE' | 'PAID';
  price: string;
  thumbnailUrl?: string;
  thumbnailName?: string;
  curriculum?: Section[];
  learningGoals?: string[];
  targetAudience?: string[];
  level?: string;
}

interface CourseCreateFormProps {
  mode?: 'create' | 'edit';
  initialData?: CourseDetail;
}

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
};

function SortableSectionItem({
  section,
  sectionIndex,
  mode,
  onTitleChange,
  onRemove,
  onAddLecture,
  onRemoveLecture,
}: {
  section: Section;
  sectionIndex: number;
  mode: 'create' | 'edit';
  onTitleChange: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onAddLecture: (sectionId: string, file: File, duration: string) => void;
  onRemoveLecture: (sectionId: string, index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-3xl border border-[#E2E8F0] bg-white p-6"
    >
      <div className="mb-4 flex items-center gap-4">
        <button
          type="button"
          className="cursor-grab text-[#94A3B8] select-none touch-none"
          {...attributes}
          {...listeners}
        >
          ☰
        </button>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onTitleChange(section.id, e.target.value)}
          placeholder={`섹션 ${sectionIndex + 1} 제목`}
          className="h-11 flex-1 rounded-xl border border-[#E2E8F0] px-4 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => onRemove(section.id)}
          className="text-[#B91C1C]"
        >
          ✕
        </button>
      </div>

      <div className="pl-8">
        <div className="mb-4 mt-3 space-y-2">
          {section.lectures.map((lecture, index) => (
            <div
              key={lecture.id}
              className="grid grid-cols-[1fr_auto_auto] items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#334155]">
                  {lecture.file?.name || lecture.fileName}
                </p>
              </div>
              <div className="mx-6">
                <p className="text-sm text-[#64748B]">{lecture.duration}</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onRemoveLecture(section.id, index)}
                  className="text-sm font-medium text-[#B91C1C]"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
        <label className="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] transition hover:bg-[#F8FAFC]">
          + 강의 영상 추가
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const video = document.createElement('video');
              video.preload = 'metadata';
              video.onerror = () => {
                URL.revokeObjectURL(video.src);
                toast.error('영상 파일을 불러올 수 없습니다.');
              };
              video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                onAddLecture(section.id, file, formatDuration(video.duration));
              };
              video.src = URL.createObjectURL(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}

export default function CourseCreateForm({
  mode = 'create',
  initialData,
}: CourseCreateFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [subjects] = useState<Subject[]>(
    SUBJECTS.map((s) => ({ subjectId: s.subjectId, name: s.name }))
  );
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [subjectId, setSubjectId] = useState<number>(initialData?.subjectId ?? 0);
  const [priceType, setPriceType] = useState<'FREE' | 'PAID'>(
    initialData?.priceType ?? 'FREE'
  );
  const [price, setPrice] = useState(initialData?.price ?? '');
  const [thumbnailPreview, setThumbnailPreview] = useState(
    initialData?.thumbnailUrl ?? ''
  );
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [sections, setSections] = useState<Section[]>(
    initialData?.curriculum ?? []
  );
  const [learningGoals, setLearningGoals] = useState<string[]>(
    initialData?.learningGoals ?? []
  );
  const [learningGoalInput, setLearningGoalInput] = useState('');
  const [targetAudience, setTargetAudience] = useState<string[]>(
    initialData?.targetAudience ?? []
  );
  const [targetAudienceInput, setTargetAudienceInput] = useState('');
  const [techTags, setTechTags] = useState<string[]>(initialData?.techTags ?? []);
  const [techTagInput, setTechTagInput] = useState('');
  const [level, setLevel] = useState(initialData?.level ?? '');
  const router = useRouter();

  const [errors, setErrors] = useState({
    title: '',
    subject: '',
    price: '',
    thumbnail: '',
    learningGoals: '',
    targetAudience: '',
    techTags: '',
    level: '',
  });
  const [firstErrorField, setFirstErrorField] = useState('');


  const titleRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const learningGoalsRef = useRef<HTMLDivElement>(null);
  const targetAudienceRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const isComposingGoalRef = useRef(false);
  const isComposingTargetRef = useRef(false);
  const techTagsRef = useRef<HTMLDivElement>(null);
  const isComposingTagRef = useRef(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const isSubmittingRef = useRef(false);

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const isFormValid =
    title.trim() &&
    subjectId > 0 &&
    learningGoals.length > 0 &&
    targetAudience.length > 0 &&
    level &&
    (thumbnail || thumbnailPreview) &&
    (priceType === 'FREE' || price.trim());

  const handleSubmit = () => {
    if (isLoading) return;
    const newErrors = {
      title: '',
      subject: '',
      price: '',
      thumbnail: '',
      learningGoals: '',
      targetAudience: '',
      techTags: '',
      level: '',
    };

    let firstError = '';

    if (!title.trim()) {
      newErrors.title = '강의명을 입력해주세요';
      if (!firstError) firstError = 'title';
    }
    if (!subjectId) {
      newErrors.subject = '과목을 선택해주세요';
      if (!firstError) firstError = 'subject';
    }
    if (learningGoals.length === 0) {
      newErrors.learningGoals = '학습목표를 1개 이상 입력해주세요';
      if (!firstError) firstError = 'learningGoals';
    }
    if (targetAudience.length === 0) {
      newErrors.targetAudience = '추천대상을 1개 이상 입력해주세요';
      if (!firstError) firstError = 'targetAudience';
    }
    if (!level) {
      newErrors.level = '난이도를 선택해주세요';
      if (!firstError) firstError = 'level';
    }
    if (!thumbnail && !thumbnailPreview) {
      newErrors.thumbnail = '썸네일을 등록해주세요';
      if (!firstError) firstError = 'thumbnail';
    }
    if (priceType === 'PAID') {
      const priceNum = Number(price);
      if (!price.trim() || !Number.isFinite(priceNum) || priceNum < 1) {
        newErrors.price = '1원 이상의 올바른 가격을 입력해주세요';
        if (!firstError) firstError = 'price';
      }
    }

    setErrors(newErrors);
    setFirstErrorField(firstError);

    if (firstError) {
      const refMap: Record<string, React.RefObject<HTMLElement | null>> = {
        title: titleRef,
        subject: subjectRef,
        learningGoals: learningGoalsRef,
        targetAudience: targetAudienceRef,
        techTags: techTagsRef,
        level: levelRef,
        thumbnail: thumbnailRef,
        price: priceRef,
      };

      const targetRef = refMap[firstError];
      targetRef?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      if ('focus' in (targetRef?.current ?? {})) {
        (targetRef?.current as HTMLElement | null)?.focus();
      }
      return;
    }

    const hasEmptySectionTitle = sections.some((sec) => !sec.title.trim());
    if (hasEmptySectionTitle) {
      toast.error('섹션 제목을 모두 입력해주세요.');
      return;
    }

    setIsConfirmOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#1E293B]">
              {mode === 'edit' ? '강의 수정' : '강의 등록'}
            </h1>
          </div>
          <p className="text-base text-[#64748B]">
            새로운 강의를 등록하고 수강생들과 공유하세요.
          </p>
        </div>

        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <h2 className="mb-8 text-xl font-bold text-[#1E293B]">기본 정보</h2>

          {/* 강의명 */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              강의명 <span className="text-[#DC2626]">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              placeholder="강의명을 입력하세요"
              value={title}
              onChange={(e) => {
                const value = e.target.value;
                setTitle(value);
                setErrors((prev) => ({
                  ...prev,
                  title: value.trim() ? '' : '강의명을 입력해주세요',
                }));
                if (firstErrorField === 'title' && value.trim())
                  setFirstErrorField('');
              }}
              className={`h-14 w-full rounded-2xl border px-5 text-base outline-none transition ${
                firstErrorField === 'title'
                  ? 'border-[#B91C1C]'
                  : 'border-[#E2E8F0] focus:border-[#2F5DAA]'
              }`}
            />
            <div className="mt-2 min-h-[20px]">
              {errors.title && (
                <div className="flex items-center gap-1">
                  <Image
                    src="/icons/error.svg"
                    alt="error"
                    width={14}
                    height={14}
                  />
                  <p className="text-sm text-[#B91C1C]">{errors.title}</p>
                </div>
              )}
            </div>
          </div>

          {/* 강의 소개 */}
          <div className="mb-8">
            <label htmlFor="course-description" className="mb-3 block text-sm font-semibold text-[#1E293B]">
              강의 소개
            </label>
            <textarea
              id="course-description"
              placeholder="강의 소개를 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-[#E2E8F0] px-5 py-4 text-base outline-none transition focus:border-[#2F5DAA] resize-none"
            />
          </div>

          {/* 과목 */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              과목 <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <select
                ref={subjectRef}
                value={subjectId || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setSubjectId(value);
                  setErrors((prev) => ({
                    ...prev,
                    subject: value ? '' : '과목을 선택해주세요',
                  }));
                  if (firstErrorField === 'subject' && value)
                    setFirstErrorField('');
                }}
                className={`h-14 w-full appearance-none rounded-2xl border bg-white px-5 pr-12 text-base outline-none transition ${
                  firstErrorField === 'subject'
                    ? 'border-[#B91C1C] text-[#1E293B]'
                    : subjectId
                      ? 'border-[#E2E8F0] text-[#1E293B] focus:border-[#2F5DAA]'
                      : 'border-[#E2E8F0] text-[#94A3B8] focus:border-[#2F5DAA]'
                }`}
              >
                <option value="" disabled hidden>
                  {'과목을 선택하세요'}
                </option>
                {subjects.map((s) => (
                  <option key={s.subjectId} value={s.subjectId}>
                    {s.name}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mt-2 min-h-[20px]">
              {errors.subject && (
                <div className="flex items-center gap-1">
                  <Image
                    src="/icons/error.svg"
                    alt="error"
                    width={14}
                    height={14}
                  />
                  <p className="text-sm text-[#B91C1C]">{errors.subject}</p>
                </div>
              )}
            </div>
          </div>

          {/* 학습목표 */}
          <div className="mb-8" ref={learningGoalsRef}>
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              학습목표 <span className="text-[#DC2626]">*</span>
            </label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={learningGoalInput}
                onChange={(e) => setLearningGoalInput(e.target.value)}
                onCompositionStart={() => { isComposingGoalRef.current = true; }}
                onCompositionEnd={() => { isComposingGoalRef.current = false; }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isComposingGoalRef.current) {
                    e.preventDefault();
                    const trimmed = learningGoalInput.trim();
                    if (trimmed && !learningGoals.includes(trimmed)) {
                      setLearningGoals((prev) => [...prev, trimmed]);
                      setErrors((prev) => ({ ...prev, learningGoals: '' }));
                      if (firstErrorField === 'learningGoals') setFirstErrorField('');
                    }
                    setLearningGoalInput('');
                  }
                }}
                placeholder="학습목표를 입력하세요"
                className="h-12 flex-1 rounded-2xl border border-[#E2E8F0] px-5 text-sm outline-none focus:border-[#2F5DAA]"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = learningGoalInput.trim();
                  if (trimmed && !learningGoals.includes(trimmed)) {
                    setLearningGoals((prev) => [...prev, trimmed]);
                    setErrors((prev) => ({ ...prev, learningGoals: '' }));
                    if (firstErrorField === 'learningGoals') setFirstErrorField('');
                  }
                  setLearningGoalInput('');
                }}
                className="h-12 rounded-2xl border border-[#2F5DAA] px-5 text-sm font-semibold text-[#2F5DAA] transition hover:bg-[#EEF4FF]"
              >
                추가
              </button>
            </div>
            {learningGoals.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {learningGoals.map((goal, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-2 rounded-full bg-[#EEF4FF] px-4 py-2 text-sm text-[#2F5DAA]"
                  >
                    {goal}
                    <button
                      type="button"
                      onClick={() =>
                        setLearningGoals((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-[#2F5DAA] opacity-60 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 min-h-[20px]">
              {errors.learningGoals && (
                <div className="flex items-center gap-1">
                  <Image src="/icons/error.svg" alt="error" width={14} height={14} />
                  <p className="text-sm text-[#B91C1C]">{errors.learningGoals}</p>
                </div>
              )}
            </div>
          </div>

          {/* 추천대상 */}
          <div className="mb-8" ref={targetAudienceRef}>
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              추천대상 <span className="text-[#DC2626]">*</span>
            </label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={targetAudienceInput}
                onChange={(e) => setTargetAudienceInput(e.target.value)}
                onCompositionStart={() => { isComposingTargetRef.current = true; }}
                onCompositionEnd={() => { isComposingTargetRef.current = false; }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isComposingTargetRef.current) {
                    e.preventDefault();
                    const trimmed = targetAudienceInput.trim();
                    if (trimmed && !targetAudience.includes(trimmed)) {
                      setTargetAudience((prev) => [...prev, trimmed]);
                      setErrors((prev) => ({ ...prev, targetAudience: '' }));
                      if (firstErrorField === 'targetAudience') setFirstErrorField('');
                    }
                    setTargetAudienceInput('');
                  }
                }}
                placeholder="추천대상을 입력하세요"
                className="h-12 flex-1 rounded-2xl border border-[#E2E8F0] px-5 text-sm outline-none focus:border-[#2F5DAA]"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = targetAudienceInput.trim();
                  if (trimmed && !targetAudience.includes(trimmed)) {
                    setTargetAudience((prev) => [...prev, trimmed]);
                    setErrors((prev) => ({ ...prev, targetAudience: '' }));
                    if (firstErrorField === 'targetAudience') setFirstErrorField('');
                  }
                  setTargetAudienceInput('');
                }}
                className="h-12 rounded-2xl border border-[#2F5DAA] px-5 text-sm font-semibold text-[#2F5DAA] transition hover:bg-[#EEF4FF]"
              >
                추가
              </button>
            </div>
            {targetAudience.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {targetAudience.map((item, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-2 rounded-full bg-[#EEF4FF] px-4 py-2 text-sm text-[#2F5DAA]"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() =>
                        setTargetAudience((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-[#2F5DAA] opacity-60 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 min-h-[20px]">
              {errors.targetAudience && (
                <div className="flex items-center gap-1">
                  <Image src="/icons/error.svg" alt="error" width={14} height={14} />
                  <p className="text-sm text-[#B91C1C]">{errors.targetAudience}</p>
                </div>
              )}
            </div>
          </div>

          {/* 연관 과목 */}
          <div className="mb-8" ref={techTagsRef}>
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              연관 과목 <span className="text-[#DC2626]">*</span>
            </label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={techTagInput}
                onChange={(e) => setTechTagInput(e.target.value)}
                onCompositionStart={() => { isComposingTagRef.current = true; }}
                onCompositionEnd={() => { isComposingTagRef.current = false; }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isComposingTagRef.current) {
                    e.preventDefault();
                    const trimmed = techTagInput.trim();
                    if (trimmed && !techTags.includes(trimmed)) {
                      setTechTags((prev) => [...prev, trimmed]);
                      setErrors((prev) => ({ ...prev, techTags: '' }));
                      if (firstErrorField === 'techTags') setFirstErrorField('');
                    }
                    setTechTagInput('');
                  }
                }}
                placeholder="연관 과목을 입력하세요"
                className="h-12 flex-1 rounded-2xl border border-[#E2E8F0] px-5 text-sm outline-none focus:border-[#2F5DAA]"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = techTagInput.trim();
                  if (trimmed && !techTags.includes(trimmed)) {
                    setTechTags((prev) => [...prev, trimmed]);
                    setErrors((prev) => ({ ...prev, techTags: '' }));
                    if (firstErrorField === 'techTags') setFirstErrorField('');
                  }
                  setTechTagInput('');
                }}
                className="h-12 rounded-2xl border border-[#2F5DAA] px-5 text-sm font-semibold text-[#2F5DAA] transition hover:bg-[#EEF4FF]"
              >
                추가
              </button>
            </div>
            {techTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {techTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-2 rounded-full bg-[#EEF4FF] px-4 py-2 text-sm text-[#2F5DAA]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setTechTags((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-[#2F5DAA] opacity-60 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 min-h-[20px]">
              {errors.techTags && (
                <div className="flex items-center gap-1">
                  <Image src="/icons/error.svg" alt="error" width={14} height={14} />
                  <p className="text-sm text-[#B91C1C]">{errors.techTags}</p>
                </div>
              )}
            </div>
          </div>

          {/* 난이도 */}
          <div className="mb-8" ref={levelRef}>
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              난이도 <span className="text-[#DC2626]">*</span>
            </label>
            <div className="flex gap-3">
              {(
                [
                  { value: '입문', label: '입문' },
                  { value: '중급', label: '중급' },
                  { value: '심화', label: '심화' },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const newLevel = level === value ? '' : value;
                    setLevel(newLevel);
                    if (newLevel) {
                      setErrors((prev) => ({ ...prev, level: '' }));
                      if (firstErrorField === 'level') setFirstErrorField('');
                    }
                  }}
                  className={`h-11 rounded-2xl px-8 text-sm font-semibold transition ${
                    level === value
                      ? 'bg-[#2F5DAA] text-white shadow-sm'
                      : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2F5DAA] hover:text-[#2F5DAA]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-2 min-h-[20px]">
              {errors.level && (
                <div className="flex items-center gap-1">
                  <Image src="/icons/error.svg" alt="error" width={14} height={14} />
                  <p className="text-sm text-[#B91C1C]">{errors.level}</p>
                </div>
              )}
            </div>
          </div>

          {/* 썸네일 */}
          <div className="mb-10" ref={thumbnailRef}>
            <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
              썸네일 이미지 <span className="text-[#DC2626]">*</span>
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
                    if (!file) return;
                    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                      setThumbnail(null);
                      setErrors((prev) => ({
                        ...prev,
                        thumbnail: 'jpg, jpeg, png 형식만 업로드 가능합니다',
                      }));
                      e.target.value = '';
                      return;
                    }
                    if (file.size > MAX_FILE_SIZE) {
                      setThumbnail(null);
                      setErrors((prev) => ({
                        ...prev,
                        thumbnail: '이미지는 5MB 이하만 업로드 가능합니다',
                      }));
                      e.target.value = '';
                      return;
                    }

                    // 성공
                    if (thumbnailPreview.startsWith('blob:')) {
                      URL.revokeObjectURL(thumbnailPreview);
                    }
                    setThumbnail(file);
                    setThumbnailPreview(URL.createObjectURL(file));
                    setErrors((prev) => ({ ...prev, thumbnail: '' }));
                    if (firstErrorField === 'thumbnail') setFirstErrorField('');
                  }}
                />
              </label>
              {(thumbnail || thumbnailPreview) && (
                <div className="flex h-12 items-center gap-3 rounded-full bg-[#F8FAFC] px-5">
                  <p className="max-w-[240px] truncate text-sm text-[#334155]">
                    {thumbnail
                      ? thumbnail.name
                      : initialData?.thumbnailName || '썸네일 이미지'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (thumbnailPreview.startsWith('blob:')) {
                        URL.revokeObjectURL(thumbnailPreview);
                      }
                      setThumbnail(null);
                      setThumbnailPreview('');
                    }}
                    className="text-[#64748B] transition hover:text-[#1E293B]"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-[#94A3B8]">
              jpg, jpeg, png 형식 / 최대 5MB
            </p>
            <div className="mt-2 min-h-[20px]">
              {errors.thumbnail && (
                <div className="flex items-center gap-1">
                  <Image
                    src="/icons/error.svg"
                    alt="error"
                    width={14}
                    height={14}
                  />
                  <p className="text-sm text-[#B91C1C]">{errors.thumbnail}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 border-t border-[#E2E8F0]" />

          {/* 가격 설정 */}
          <div className="mb-8">
            <h2 className="mb-6 text-xl font-bold text-[#1E293B]">가격 설정</h2>
            <div className="mb-6 flex items-center gap-8">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  disabled={mode === 'edit'}
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
                  disabled={mode === 'edit'}
                  checked={priceType === 'PAID'}
                  onChange={() => setPriceType('PAID')}
                />
                <span className="text-sm font-medium text-[#1E293B]">
                  유료 강의
                </span>
              </label>
            </div>
            {priceType === 'PAID' && (
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
                  가격
                </label>
                <div
                  className={`flex h-14 w-[220px] items-center rounded-2xl border px-5 ${
                    firstErrorField === 'price'
                      ? 'border-[#B91C1C]'
                      : 'border-[#E2E8F0]'
                  }`}
                >
                  <input
                    ref={priceRef}
                    disabled={mode === 'edit'}
                    type="number"
                    min="1"
                    step="1"
                    value={price}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPrice(value);
                      const num = Number(value);
                      const valid = value.trim() && Number.isFinite(num) && num >= 1;
                      setErrors((prev) => ({
                        ...prev,
                        price: valid ? '' : '1원 이상의 올바른 가격을 입력해주세요',
                      }));
                      if (firstErrorField === 'price' && valid) setFirstErrorField('');
                    }}
                    className="w-full bg-transparent text-base outline-none"
                  />
                  <span className="text-sm text-[#64748B]">원</span>
                </div>
              </div>
            )}
            <div className="mt-2 min-h-[20px]">
              {errors.price && (
                <div className="flex items-center gap-1">
                  <Image
                    src="/icons/error.svg"
                    alt="error"
                    width={14}
                    height={14}
                  />
                  <p className="text-sm text-[#B91C1C]">{errors.price}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 border-t border-[#E2E8F0]" />

          {/* 커리큘럼 */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1E293B]">커리큘럼</h2>
              <button
                type="button"
                onClick={() =>
                  setSections((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
                      title: '',
                      lectures: [],
                    },
                  ])
                }
                className="rounded-xl border border-[#2F5DAA] px-4 py-2 text-sm font-semibold text-[#2F5DAA] transition hover:bg-[#EEF4FF]"
              >
                + 섹션 추가
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="flex h-[220px] flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <Image
                  src="/icons/curri.svg"
                  alt="empty curriculum"
                  width={48}
                  height={48}
                  className="mb-4 opacity-40"
                />
                <p className="text-sm text-[#64748B]">
                  섹션을 추가하여 커리큘럼을 구성하세요
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-5">
                    {sections.map((section, sectionIndex) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        sectionIndex={sectionIndex}
                        mode={mode}
                        onTitleChange={(id, title) =>
                          setSections((prev) =>
                            prev.map((item) =>
                              item.id === id ? { ...item, title } : item
                            )
                          )
                        }
                        onRemove={(id) =>
                          setSections((prev) =>
                            prev.filter((item) => item.id !== id)
                          )
                        }
                        onAddLecture={(sectionId, file, duration) =>
                          setSections((prev) =>
                            prev.map((item) =>
                              item.id === sectionId
                                ? {
                                    ...item,
                                    lectures: [
                                      ...item.lectures,
                                      {
                                        id: crypto.randomUUID(),
                                        file,
                                        fileName: file.name,
                                        duration,
                                      },
                                    ],
                                  }
                                : item
                            )
                          )
                        }
                        onRemoveLecture={(sectionId, index) =>
                          setSections((prev) =>
                            prev.map((item) =>
                              item.id === sectionId
                                ? {
                                    ...item,
                                    lectures: item.lectures.filter(
                                      (_, i) => i !== index
                                    ),
                                  }
                                : item
                            )
                          )
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-8 flex items-center gap-5">
          <button
            type="button"
            onClick={() => setIsCancelOpen(true)}
            className="h-14 flex-1 rounded-2xl border border-[#E2E8F0] bg-white text-base font-semibold text-[#475569] transition hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`h-14 flex-1 rounded-2xl text-base font-semibold text-white transition ${
              isFormValid && !isLoading
                ? 'bg-[#2F5DAA] opacity-100 hover:bg-[#1D3E75]'
                : 'bg-[#2F5DAA] opacity-50 cursor-not-allowed'
            }`}
          >
            {mode === 'edit' ? '강의 수정' : '강의 등록'}
          </button>
        </div>

        {isConfirmOpen && (
          <DoubleBtnModal
            title={mode === 'edit' ? '강의 수정' : '강의 등록'}
            description={
              mode === 'edit'
                ? '정말 이 강의를 수정하시겠습니까?'
                : '정말 이 강의를 등록하시겠습니까?'
            }
            leftText="취소"
            rightText="확인"
            onLeftClick={() => setIsConfirmOpen(false)}
            onRightClick={async () => {
              if (isSubmittingRef.current) return;
              isSubmittingRef.current = true;
              setIsConfirmOpen(false);
              setIsLoading(true);

              try {
                let thumbnailUrl = thumbnailPreview;
                if (thumbnail) {
                  const uploadResult = await uploadCourseThumbnail(thumbnail);
                  if (!uploadResult.success || !uploadResult.data?.fileUrl) {
                    setErrors((prev) => ({
                      ...prev,
                      thumbnail: '썸네일 업로드에 실패했습니다.',
                    }));
                    isSubmittingRef.current = false;
                    setIsLoading(false);
                    return;
                  }
                  thumbnailUrl = uploadResult.data.fileUrl;
                }

                const payload = {
                  title,
                  description,
                  subject: subjectValueById(subjectId) ?? '',
                  thumbnailUrl: thumbnailUrl || undefined,
                  priceType,
                  price: priceType === 'FREE' ? 0 : Number(price),
                  learningObjectives: learningGoals,
                  targetAudience,
                  techTags,
                  level: level || undefined,
                  sections: sections.map((sec, sIdx) => ({
                    ...(mode === 'edit' && Number(sec.id) ? { sectionId: Number(sec.id) } : {}),
                    title: sec.title,
                    orderIndex: sIdx,
                    lessons: sec.lectures.map((lec, lIdx) => ({
                      ...(mode === 'edit' && Number(lec.id) ? { lessonId: Number(lec.id) } : {}),
                      title: lec.fileName,
                      description: lec.fileName || undefined,
                      orderIndex: lIdx,
                      durationSeconds: lec.duration
                        ? (() => {
                            const parts = lec.duration.split(':').map(Number);
                            if (parts.length === 3)
                              return (
                                (parts[0] || 0) * 3600 +
                                (parts[1] || 0) * 60 +
                                (parts[2] || 0)
                              );
                            if (parts.length === 2)
                              return (parts[0] || 0) * 60 + (parts[1] || 0);
                            return undefined;
                          })()
                        : undefined,
                    })),
                  })),
                };

                if (mode === 'edit' && !initialData?.courseId) {
                  toast.error('강의 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
                  isSubmittingRef.current = false;
                  setIsLoading(false);
                  return;
                }

                const result =
                  mode === 'edit' && initialData
                    ? await updateCourse(initialData.courseId!, payload)
                    : await createCourse(payload);

                if (!result.success) {
                  isSubmittingRef.current = false;
                  setIsLoading(false);
                  toast.error(result.message || '강의 저장에 실패했습니다.');
                  return;
                }

                const savedCourseId: number =
                  result.data?.courseId ??
                  (mode === 'edit' ? (initialData?.courseId ?? 0) : 0);

                const hasFiles = sections.some((sec) =>
                  sec.lectures.some((lec) => lec.file)
                );

                if (hasFiles && savedCourseId) {
                  interface LessonApiItem { lessonId: number; }
                  interface SectionApiItem { lessons: LessonApiItem[]; }
                  interface CourseDetailForUpload { sections: SectionApiItem[]; }

                  const detailRes = await api.get<CourseDetailForUpload>(
                    `/api/courses/${savedCourseId}`
                  );
                  if (detailRes.success && detailRes.data) {
                    const apiSections = detailRes.data.sections ?? [];
                    let uploadFailed = false;
                    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
                      if (uploadFailed) break;
                      const apiSection = apiSections[sIdx];
                      if (!apiSection) continue;
                      const apiLessons = apiSection.lessons ?? [];
                      for (
                        let lIdx = 0;
                        lIdx < sections[sIdx].lectures.length;
                        lIdx++
                      ) {
                        const lecture = sections[sIdx].lectures[lIdx];
                        const apiLesson = apiLessons[lIdx];
                        if (lecture.file && apiLesson?.lessonId) {
                          const videoForm = new FormData();
                          videoForm.append('file', lecture.file);
                          try {
                            await axios.post(
                              `/api/courses/lessons/${apiLesson.lessonId}/video`,
                              videoForm
                            );
                          } catch (err) {
                            console.error(
                              `영상 업로드 실패 lessonId=${apiLesson.lessonId}`,
                              err
                            );
                            toast.error('영상 업로드에 실패했습니다. 다시 시도해주세요.');
                            uploadFailed = true;
                            break;
                          }
                        }
                      }
                    }
                    if (uploadFailed) {
                      isSubmittingRef.current = false;
                      setIsLoading(false);
                      return;
                    }
                  }
                }

                sessionStorage.setItem(
                  'courseToastType',
                  mode === 'edit' ? 'edit' : 'create'
                );
                isSubmittingRef.current = false;
                setIsLoading(false);
                router.refresh();
                router.push('/instructor/myCourses');
              } catch (error) {
                isSubmittingRef.current = false;
                setIsLoading(false);
                console.error(error);
              }
            }}
          />
        )}

        {isLoading && (
          <LoadingModal
            title={
              mode === 'edit'
                ? '강의를 수정하고 있습니다'
                : '강의를 등록하고 있습니다'
            }
            description="잠시만 기다려주세요."
          />
        )}

        {isCancelOpen && (
          <DoubleBtnModal
            title={mode === 'edit' ? '강의 수정 취소' : '강의 등록 취소'}
            description={
              mode === 'edit'
                ? '정말 강의 수정을 취소하시겠습니까?'
                : '정말 강의 등록을 취소하시겠습니까?'
            }
            leftText="취소"
            rightText="확인"
            onLeftClick={() => setIsCancelOpen(false)}
            onRightClick={() => {
              setIsCancelOpen(false);
              router.push('/instructor/myCourses');
            }}
          />
        )}
      </div>
    </div>
  );
}
