'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { getInstructorCourses } from '@/features/instructor/services';
import {
  getNotices,
  getNoticeDetail,
  createCourseNotice,
  updateNotice,
  deleteNotice,
} from '@/features/notices/services';

interface CourseOption {
  id: number;
  title: string;
}

interface Notice {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  content: string;
  createdAt: string;
  views: number;
  isPinned: boolean;
}

export default function InstructorNoticeTable() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [isCourseOpen, setIsCourseOpen] = useState(false);

  // 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deletingNoticeId, setDeletingNoticeId] = useState<number | null>(null);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);

  // 폼 상태
  const [formCourseId, setFormCourseId] = useState<number>(0);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // 강의 공지 목록 로드 (GET /api/notices?type=COURSE&courseId=)
  const reloadNotices = useCallback(async (courseId: number) => {
    if (!courseId) {
      setNotices([]);
      return;
    }
    const res = await getNotices({ type: 'COURSE', courseId, size: 100 });
    if (!res.success || !res.data) {
      setNotices([]);
      return;
    }
    setNotices(
      res.data.content.map((n) => ({
        id: n.noticeId,
        courseId,
        courseTitle: n.courseName ?? '',
        title: n.title,
        content: '',
        createdAt: (n.createdAt.split('T')[0] ?? n.createdAt).replace(/-/g, '/'),
        views: 0,
        isPinned: n.isPinned,
      })),
    );
  }, []);

  // 강사 본인 강의 목록 (GET /api/instructor/courses)
  useEffect(() => {
    getInstructorCourses().then((res) => {
      if (res.success && res.data) {
        const list = res.data.content.map((c) => ({ id: c.courseId, title: c.title }));
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(list[0].id);
          setFormCourseId(list[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    reloadNotices(selectedCourseId);
  }, [selectedCourseId, reloadNotices]);

  // 목록은 서버에서 이미 강의별 필터됨 — 고정 공지 우선 정렬만
  const filteredNotices = [...notices].sort(
    (a, b) => Number(b.isPinned) - Number(a.isPinned),
  );

  const selectedCourseName =
    courses.find((c) => c.id === selectedCourseId)?.title ?? '';

  const openCreate = () => {
    setModalMode('create');
    setEditingNotice(null);
    setFormCourseId(selectedCourseId);
    setFormTitle('');
    setFormContent('');
    setFormIsPinned(false);
    setTitleError('');
    setContentError('');
    setSubmitted(false);
    setIsModalOpen(true);
  };

  const openEdit = async (notice: Notice) => {
    setModalMode('edit');
    setEditingNotice(notice);
    setFormCourseId(notice.courseId);
    setFormTitle(notice.title);
    // 목록 응답엔 content가 없어 상세 조회로 본문 채움
    const detail = await getNoticeDetail(notice.id);
    setFormContent(detail.success && detail.data ? detail.data.content : notice.content);
    setFormIsPinned(notice.isPinned);
    setTitleError('');
    setContentError('');
    setSubmitted(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    const isTitleEmpty = !formTitle.trim();
    const isContentEmpty = !formContent.trim();

    if (isTitleEmpty) setTitleError('제목을 입력해주세요');
    if (isContentEmpty) setContentError('내용을 입력해주세요');

    if (isTitleEmpty || isContentEmpty) {
      if (isTitleEmpty) titleRef.current?.focus();
      else contentRef.current?.focus();
      return;
    }

    const body = {
      title: formTitle.trim(),
      content: formContent.trim(),
      isPinned: formIsPinned,
    };

    if (modalMode === 'create') {
      // POST /api/courses/{courseId}/notices
      const res = await createCourseNotice(formCourseId, body);
      if (!res.success) {
        toast.error(res.message || '공지사항 등록에 실패했습니다.');
        return;
      }
      toast.success('공지사항이 등록되었습니다.');
    } else if (editingNotice) {
      // PATCH /api/notices/{noticeId}
      const res = await updateNotice(editingNotice.id, body);
      if (!res.success) {
        toast.error(res.message || '공지사항 수정에 실패했습니다.');
        return;
      }
      toast.success('공지사항이 수정되었습니다.');
    }
    setIsModalOpen(false);
    await reloadNotices(selectedCourseId);
  };

  const handleDelete = async (id: number) => {
    // DELETE /api/notices/{noticeId}
    const res = await deleteNotice(id);
    if (!res.success) {
      toast.error(res.message || '공지사항 삭제에 실패했습니다.');
      return;
    }
    setDeletingNoticeId(null);
    toast.success('공지사항이 삭제되었습니다.');
    await reloadNotices(selectedCourseId);
  };

  const isFormValid = formTitle.trim() !== '' && formContent.trim() !== '';
  const modalCourseTitle =
    courses.find((c) => c.id === formCourseId)?.title ?? '';

  return (
    <div>
      {/* 필터 + 작성 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        {/* 강의 선택 드롭다운 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCourseOpen((prev) => !prev)}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#374151] shadow-sm"
          >
            {selectedCourseName}
            <Image
              src="/icons/chevronDownIcon.svg"
              alt="down"
              width={16}
              height={16}
              className={`transition-transform ${isCourseOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isCourseOpen && (
            <div className="absolute z-10 mt-1 w-52 rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
              {courses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCourseId(c.id);
                    setIsCourseOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#F8FAFC] ${
                    selectedCourseId === c.id
                      ? 'font-semibold text-[#2F5DAA]'
                      : 'text-[#374151]'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-[#2F5DAA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D3E75]"
        >
          + 공지 작성
        </button>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                제목
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                작성일
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                조회
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                상태
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredNotices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-16 text-center text-sm text-[#94A3B8]"
                >
                  등록된 공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              filteredNotices.map((notice) => (
                <tr
                  key={notice.id}
                  className="border-b border-[#E2E8F0] last:border-none hover:bg-[#F8FAFC]"
                >
                  <td className="px-6 py-4">
                    <Link href={`/instructor/notices/${notice.id}`}>
                      <div className="flex cursor-pointer items-center gap-2">
                        {notice.isPinned && (
                          <Image
                            src="/icons/noticePin.svg"
                            alt="중요"
                            width={16}
                            height={16}
                          />
                        )}
                        <span className="text-sm font-medium text-[#1E293B] hover:text-[#2F5DAA] hover:underline">
                          {notice.title}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">
                    {notice.createdAt}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">
                    {notice.views}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        notice.isPinned
                          ? 'bg-[#FEE2E2] text-[#EF4444]'
                          : 'bg-[#E0F2FE] text-[#0284C7]'
                      }`}
                    >
                      {notice.isPinned ? '중요' : '일반'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => openEdit(notice)}>
                        <Image
                          src="/icons/editIcon.svg"
                          alt="수정"
                          width={18}
                          height={18}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingNoticeId(notice.id)}
                      >
                        <Image
                          src="/icons/trashIcon.svg"
                          alt="삭제"
                          width={18}
                          height={18}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 공지 작성/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-xl font-bold text-[#1F2937]">
              {modalMode === 'create' ? '공지 작성' : '공지 수정'}
            </h2>

            {/* 대상 강의 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                대상 강의
              </label>
              <div className="flex h-11 items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#1E293B]">
                {modalCourseTitle}
              </div>
            </div>

            {/* 제목 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                제목 *
              </label>
              <input
                ref={titleRef}
                type="text"
                placeholder="공지사항 제목을 입력하세요"
                value={formTitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormTitle(val);
                  if (submitted) {
                    setTitleError(
                      val.trim() === '' ? '제목을 입력해주세요' : '',
                    );
                  }
                }}
                className={`h-11 w-full rounded-xl border px-4 text-sm outline-none placeholder:text-[#9CA3AF] ${
                  titleError ? 'border-[#EF4444]' : 'border-[#E2E8F0]'
                }`}
              />
              <div className="mt-1 flex min-h-[20px] items-center gap-1 text-xs text-[#EF4444]">
                {titleError && (
                  <>
                    <Image
                      src="/icons/error.svg"
                      alt="error"
                      width={12}
                      height={12}
                    />
                    {titleError}
                  </>
                )}
              </div>
            </div>

            {/* 내용 */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                내용 *
              </label>
              <textarea
                ref={contentRef}
                placeholder="공지사항 내용을 입력하세요"
                value={formContent}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormContent(val);
                  if (submitted) {
                    setContentError(
                      val.trim() === '' ? '내용을 입력해주세요' : '',
                    );
                  }
                }}
                rows={5}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none placeholder:text-[#9CA3AF] ${
                  contentError && formTitle.trim() !== ''
                    ? 'border-[#EF4444]'
                    : 'border-[#E2E8F0]'
                }`}
              />
              <div className="mt-1 flex min-h-[20px] items-center gap-1 text-xs text-[#EF4444]">
                {contentError && (
                  <>
                    <Image
                      src="/icons/error.svg"
                      alt="error"
                      width={12}
                      height={12}
                    />
                    {contentError}
                  </>
                )}
              </div>
            </div>

            {/* 중요 공지 체크박스 */}
            <label className="mb-6 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={formIsPinned}
                onChange={(e) => setFormIsPinned(e.target.checked)}
                className="h-4 w-4 accent-[#2F5DAA]"
              />
              <span className="text-sm text-[#374151]">
                중요 공지로 설정 (상단 고정)
              </span>
            </label>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={
                  modalMode === 'edit'
                    ? () => setIsEditConfirmOpen(true)
                    : handleSubmit
                }
                className={`h-12 flex-1 rounded-xl text-sm font-semibold text-white transition ${
                  isFormValid
                    ? 'bg-[#2F5DAA] hover:bg-[#1D3E75]'
                    : 'bg-[#2F5DAA] opacity-50'
                }`}
              >
                {modalMode === 'edit' ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 수정 확인 모달 */}
      {isEditConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-[448px] rounded-2xl bg-white p-8"
            style={{
              boxShadow:
                '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            }}
          >
            <h2 className="text-center text-2xl font-bold text-[#1F2937]">
              공지 수정
            </h2>
            <p className="mt-3 text-center text-base text-[#4B5563]">
              수정하시겠습니까?
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditConfirmOpen(false)}
                className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditConfirmOpen(false);
                  handleSubmit();
                }}
                className="h-12 flex-1 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 삭제 확인 모달 */}
      {deletingNoticeId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-[448px] rounded-2xl bg-white p-8"
            style={{
              boxShadow:
                '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
            }}
          >
            <h2 className="text-center text-2xl font-bold text-[#1F2937]">
              공지 삭제
            </h2>
            <p className="mt-3 text-center text-base text-[#4B5563]">
              공지사항을 삭제하시겠습니까?
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingNoticeId(null)}
                className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingNoticeId)}
                className="h-12 flex-1 rounded-[10px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
