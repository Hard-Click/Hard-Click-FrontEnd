'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import DoubleBtnModal from '@/components/ui/doubleButtonModal';
import { useRouter } from 'next/navigation';
import LoadingModal from '@/components/ui/loadingModal';
import { createCourse, updateCourse, uploadCourseThumbnail } from '../services';
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
  subject: string;
  description: string;
  priceType: 'FREE' | 'PAID';
  price: string;
  thumbnailUrl?: string;
  thumbnailName?: string;
  curriculum?: Section[];
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

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
  const [subject, setSubject] = useState(initialData?.subject ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [priceType, setPriceType] = useState<'FREE' | 'PAID'>(initialData?.priceType ?? 'FREE');
  const [price, setPrice] = useState(initialData?.price ?? '');
  const [thumbnailPreview, setThumbnailPreview] = useState(initialData?.thumbnailUrl ?? '');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [sections, setSections] = useState<Section[]>(initialData?.curriculum ?? []);
  const router = useRouter();

  const [errors, setErrors] = useState({
    title: '',
    subject: '',
    description: '',
    price: '',
    thumbnail: '',
  });
  const [firstErrorField, setFirstErrorField] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

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
    subject &&
    description.trim() &&
    (thumbnail || thumbnailPreview) &&
    (priceType === 'FREE' || price.trim());

  const handleSubmit = () => {
    const newErrors = {
      title: '',
      subject: '',
      description: '',
      price: '',
      thumbnail: '',
    };

    let firstError = '';

    if (!title.trim()) {
      newErrors.title = '강의명을 입력해주세요';
      if (!firstError) firstError = 'title';
    }
    if (!subject) {
      newErrors.subject = '과목을 선택해주세요';
      if (!firstError) firstError = 'subject';
    }
    if (!description.trim()) {
      newErrors.description = '강의 설명을 입력해주세요';
      if (!firstError) firstError = 'description';
    }
    if (priceType === 'PAID' && !price.trim()) {
      newErrors.price = '가격을 입력해주세요';
      if (!firstError) firstError = 'price';
    }
    if (!thumbnail && !thumbnailPreview) {
      newErrors.thumbnail = '썸네일을 등록해주세요';
      if (!firstError) firstError = 'thumbnail';
    }

    setErrors(newErrors);
    setFirstErrorField(firstError);

    if (firstError) {
      const refMap = {
        title: titleRef,
        subject: subjectRef,
        description: descriptionRef,
        price: priceRef,
      };

      const targetRef = refMap[firstError as keyof typeof refMap];
      targetRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetRef?.current?.focus();
      return;
    }

    setIsConfirmOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
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
              setErrors((prev) => ({ ...prev, title: value.trim() ? '' : '강의명을 입력해주세요' }));
              if (firstErrorField === 'title' && value.trim()) setFirstErrorField('');
            }}
            className={`h-14 w-full rounded-2xl border px-5 text-base outline-none transition ${
              firstErrorField === 'title' ? 'border-[#B91C1C]' : 'border-[#E2E8F0] focus:border-[#2F5DAA]'
            }`}
          />
          <div className="mt-2 min-h-[20px]">
            {errors.title && (
              <div className="flex items-center gap-1">
                <Image src="/icons/error.svg" alt="error" width={14} height={14} />
                <p className="text-sm text-[#B91C1C]">{errors.title}</p>
              </div>
            )}
          </div>
        </div>

        {/* 과목 */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            과목 <span className="text-[#DC2626]">*</span>
          </label>
          <select
            ref={subjectRef}
            value={subject}
            onChange={(e) => {
              const value = e.target.value;
              setSubject(value);
              setErrors((prev) => ({ ...prev, subject: value ? '' : '과목을 선택해주세요' }));
              if (firstErrorField === 'subject' && value) setFirstErrorField('');
            }}
            className={`h-14 w-full rounded-2xl border px-5 text-base outline-none transition ${
              firstErrorField === 'subject' ? 'border-[#B91C1C]' : 'border-[#E2E8F0] focus:border-[#2F5DAA]'
            }`}
          >
            <option value="">과목 선택</option>
            {SUBJECT_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <div className="mt-2 min-h-[20px]">
            {errors.subject && (
              <div className="flex items-center gap-1">
                <Image src="/icons/error.svg" alt="error" width={14} height={14} />
                <p className="text-sm text-[#B91C1C]">{errors.subject}</p>
              </div>
            )}
          </div>
        </div>

        {/* 설명 */}
        <div className="mb-8">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            강의 설명 <span className="text-[#DC2626]">*</span>
          </label>
          <textarea
            ref={descriptionRef}
            placeholder="강의 내용을 상세히 설명해주세요"
            value={description}
            onChange={(e) => {
              const value = e.target.value;
              setDescription(value);
              setErrors((prev) => ({ ...prev, description: value.trim() ? '' : '강의 설명을 입력해주세요' }));
              if (firstErrorField === 'description' && value.trim()) setFirstErrorField('');
            }}
            className={`min-h-[180px] w-full rounded-2xl border p-5 text-base outline-none transition ${
              firstErrorField === 'description' ? 'border-[#B91C1C]' : 'border-[#E2E8F0] focus:border-[#2F5DAA]'
            }`}
          />
          <div className="mt-2 min-h-[20px]">
            {errors.description && (
              <div className="flex items-center gap-1">
                <Image src="/icons/error.svg" alt="error" width={14} height={14} />
                <p className="text-sm text-[#B91C1C]">{errors.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* 썸네일 */}
        <div className="mb-10">
          <label className="mb-3 block text-sm font-semibold text-[#1E293B]">
            썸네일 이미지
          </label>
          <div className="flex items-center gap-4">
            <label className="flex h-14 w-fit cursor-pointer items-center gap-2 rounded-2xl border border-[#E2E8F0] px-5 transition hover:bg-[#F8FAFC]">
              <Image src="/icons/upload.svg" alt="upload" width={18} height={18} />
              <span className="text-sm font-medium text-[#334155]">이미지 업로드</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    setThumbnail(null);
                    setErrors((prev) => ({ ...prev, thumbnail: 'jpg, jpeg, png 형식만 업로드 가능합니다' }));
                    e.target.value = '';
                    return;
                  }
                  if (file.size > MAX_FILE_SIZE) {
                    setThumbnail(null);
                    setErrors((prev) => ({ ...prev, thumbnail: '이미지는 5MB 이하만 업로드 가능합니다' }));
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
                  {thumbnail ? thumbnail.name : initialData?.thumbnailName || '썸네일 이미지'}
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
          <p className="mt-3 text-sm text-[#94A3B8]">jpg, jpeg, png 형식 / 최대 5MB</p>
          <div className="mt-2 min-h-[20px]">
            {errors.thumbnail && (
              <div className="flex items-center gap-1">
                <Image src="/icons/error.svg" alt="error" width={14} height={14} />
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
              <span className="text-sm font-medium text-[#1E293B]">무료 강의</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                disabled={mode === 'edit'}
                checked={priceType === 'PAID'}
                onChange={() => setPriceType('PAID')}
              />
              <span className="text-sm font-medium text-[#1E293B]">유료 강의</span>
            </label>
          </div>
          {priceType === 'PAID' && (
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#1E293B]">가격</label>
              <div className={`flex h-14 w-[220px] items-center rounded-2xl border px-5 ${firstErrorField === 'price' ? 'border-[#B91C1C]' : 'border-[#E2E8F0]'}`}>
                <input
                  ref={priceRef}
                  disabled={mode === 'edit'}
                  type="number"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPrice(value);
                    setErrors((prev) => ({ ...prev, price: value.trim() ? '' : '가격을 입력해주세요' }));
                    if (firstErrorField === 'price' && value.trim()) setFirstErrorField('');
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
                <Image src="/icons/error.svg" alt="error" width={14} height={14} />
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
              <Image src="/icons/curri.svg" alt="empty curriculum" width={48} height={48} className="mb-4 opacity-40" />
              <p className="text-sm text-[#64748B]">섹션을 추가하여 커리큘럼을 구성하세요</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
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
                            item.id === id ? { ...item, title } : item,
                          ),
                        )
                      }
                      onRemove={(id) =>
                        setSections((prev) => prev.filter((item) => item.id !== id))
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
                              : item,
                          ),
                        )
                      }
                      onRemoveLecture={(sectionId, index) =>
                        setSections((prev) =>
                          prev.map((item) =>
                            item.id === sectionId
                              ? {
                                  ...item,
                                  lectures: item.lectures.filter(
                                    (_, i) => i !== index,
                                  ),
                                }
                              : item,
                          ),
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
          className={`h-14 flex-1 rounded-2xl text-base font-semibold text-white transition ${
            isFormValid ? 'bg-[#2F5DAA] opacity-100 hover:bg-[#1D3E75]' : 'bg-[#2F5DAA] opacity-50'
          }`}
        >
          {mode === 'edit' ? '강의 수정' : '강의 등록'}
        </button>
      </div>

      {isConfirmOpen && (
        <DoubleBtnModal
          title={mode === 'edit' ? '강의 수정' : '강의 등록'}
          description={mode === 'edit' ? '정말 이 강의를 수정하시겠습니까?' : '정말 이 강의를 등록하시겠습니까?'}
          leftText="취소"
          rightText="확인"
          onLeftClick={() => setIsConfirmOpen(false)}
          onRightClick={async () => {
            setIsConfirmOpen(false);
            setIsLoading(true);

            try {
              let thumbnailUrl = thumbnailPreview;
              if (thumbnail) {
                const uploadResult = await uploadCourseThumbnail(thumbnail);
                if (!uploadResult.success || !uploadResult.data?.fileUrl) {
                  setErrors((prev) => ({ ...prev, thumbnail: '썸네일 업로드에 실패했습니다.' }));
                  setIsLoading(false);
                  return;
                }
                thumbnailUrl = uploadResult.data.fileUrl;
              }

              const payload = {
                title,
                subject,
                description,
                thumbnailUrl,
                priceType,
                price: priceType === 'FREE' ? 0 : Number(price),
                sections: sections.map((sec, sIdx) => ({
                  title: sec.title,
                  orderIndex: sIdx,
                  lessons: sec.lectures.map((lec, lIdx) => ({
                    title: lec.fileName,
                    description: '',
                    orderIndex: lIdx,
                    durationSeconds: lec.duration
                      ? (() => {
                          const parts = lec.duration.split(':').map(Number);
                          if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
                          if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
                          return undefined;
                        })()
                      : undefined,
                  })),
                })),
              };

              const result =
                mode === 'edit' && initialData
                  ? await updateCourse(initialData.courseId ?? 0, payload)
                  : await createCourse(payload);

              if (!result.success) {
                setIsLoading(false);
                toast.error(result.message || '강의 저장에 실패했습니다.');
                return;
              }

              const savedCourseId: number =
                result.data?.courseId ?? (mode === 'edit' ? (initialData?.courseId ?? 0) : 0);

              const hasFiles = sections.some((sec) => sec.lectures.some((lec) => lec.file));

              if (hasFiles && savedCourseId) {
                const detailRes = await api.get<any>(`/api/courses/${savedCourseId}`);
                if (detailRes.success && detailRes.data) {
                  const apiSections: any[] = detailRes.data.sections ?? [];
                  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
                    const apiSection = apiSections[sIdx];
                    if (!apiSection) continue;
                    const apiLessons: any[] = apiSection.lessons ?? [];
                    for (let lIdx = 0; lIdx < sections[sIdx].lectures.length; lIdx++) {
                      const lecture = sections[sIdx].lectures[lIdx];
                      const apiLesson = apiLessons[lIdx];
                      if (lecture.file && apiLesson?.lessonId) {
                        const videoForm = new FormData();
                        videoForm.append('file', lecture.file);
                        try {
                          await axios.post(`/api/courses/lessons/${apiLesson.lessonId}/video`, videoForm);
                        } catch (err) {
                          console.error(`영상 업로드 실패 lessonId=${apiLesson.lessonId}`, err);
                        }
                      }
                    }
                  }
                }
              }

              sessionStorage.setItem('courseToastType', mode === 'edit' ? 'edit' : 'create');
              setIsLoading(false);
              router.push('/instructor/myCourses');
            } catch (error) {
              setIsLoading(false);
              console.error(error);
            }
          }}
        />
      )}

      {isLoading && (
        <LoadingModal
          title={mode === 'edit' ? '강의를 수정하고 있습니다' : '강의를 등록하고 있습니다'}
          description="잠시만 기다려주세요."
        />
      )}

      {isCancelOpen && (
        <DoubleBtnModal
          title={mode === 'edit' ? '강의 수정 취소' : '강의 등록 취소'}
          description={mode === 'edit' ? '정말 강의 수정을 취소하시겠습니까?' : '정말 강의 등록을 취소하시겠습니까?'}
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
  );
}
