'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import DoubleBtnModal from '@/components/ui/doubleButtonModal';
import type { AdminNoticeRow } from '@/mocks/admin.mock';
import AdminNoticeFormModal from './AdminNoticeFormModal';

export default function AdminNoticeTable({
  notices,
  detailBasePath = '/admin/notices',
}: {
  notices: AdminNoticeRow[];
  // 공지 상세 링크 base. 공지 관리=/admin/notices(기본), 강의 공지 목록=강의 경로(헤더 '강의' 유지)
  detailBasePath?: string;
}) {
  const [rows, setRows] = useState<AdminNoticeRow[]>(notices);
  useEffect(() => {
    setRows(notices);
  }, [notices]);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingNotice, setEditingNotice] = useState<AdminNoticeRow | null>(
    null
  );

  const handleTogglePublish = (id: number) => {
    const target = rows.find((n) => n.id === id);
    setRows((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPublished: !n.isPublished } : n))
    );
    toast.success(
      target?.isPublished
        ? '공지가 비공개되었습니다.'
        : '공지가 게시되었습니다.'
    );
  };

  const handleDelete = (id: number) => {
    setRows((prev) => prev.filter((n) => n.id !== id));
    setDeletingId(null);
    toast.success('공지사항이 삭제되었습니다.');
  };

  return (
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
            <th className="px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              중요
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              상태
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-[#374151]">
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="py-16 text-center text-sm text-[#94A3B8]"
              >
                등록된 공지사항이 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((notice) => (
              <tr
                key={notice.id}
                className="border-b border-[#E2E8F0] last:border-none hover:bg-[#F8FAFC]"
              >
                <td className="px-6 py-4">
                  <Link href={`${detailBasePath}/${notice.id}`}>
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
                        {notice.type === 'COURSE' && notice.courseTitle
                          ? `${notice.courseTitle} - ${notice.title}`
                          : notice.title}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-[#64748B]">
                  {notice.createdAt}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      notice.isPinned
                        ? 'bg-[#FEE2E2] text-[#EF4444]'
                        : 'bg-[#E0F2FE] text-[#0284C7]'
                    }`}
                  >
                    {notice.isPinned ? '중요' : '일반'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      notice.isPublished
                        ? 'bg-[#DCFCE7] text-[#16A34A]'
                        : 'bg-[#FEF3C7] text-[#D97706]'
                    }`}
                  >
                    {notice.isPublished ? '게시중' : '비공개'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(notice.id)}
                    >
                      <Image
                        src={
                          notice.isPublished
                            ? '/icons/openEye.svg'
                            : '/icons/closeEye.svg'
                        }
                        alt={notice.isPublished ? '게시중' : '비공개'}
                        width={18}
                        height={18}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNotice(notice)}
                    >
                      <Image
                        src="/icons/editIcon.svg"
                        alt="수정"
                        width={18}
                        height={18}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(notice.id)}
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

      {/* 삭제 확인 모달 */}
      {deletingId !== null && (
        <DoubleBtnModal
          title="공지 삭제"
          description="공지사항을 삭제하시겠습니까?"
          leftText="취소"
          rightText="삭제"
          onLeftClick={() => setDeletingId(null)}
          onRightClick={() => handleDelete(deletingId)}
        />
      )}

      {editingNotice && (
        <AdminNoticeFormModal
          mode="edit"
          noticeId={editingNotice.id}
          courseTitle={editingNotice.courseTitle}
          initialTitle={editingNotice.title}
          initialContent={editingNotice.content}
          initialIsPinned={editingNotice.isPinned}
          onClose={() => setEditingNotice(null)}
        />
      )}
    </div>
  );
}
