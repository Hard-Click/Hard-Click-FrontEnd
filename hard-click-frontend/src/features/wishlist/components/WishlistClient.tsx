'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { addToCart, enrollCourse } from '@/features/courses/actions';
import { removeWishlistAction } from '../actions';
import WishlistCard from './WishlistCard';
import WishlistEmptyState from './WishlistEmptyState';
import type { WishlistCourse } from '../types';

/**
 * 찜한 강의 상호작용 섬(client) — 데이터는 server에서 props로 받음.
 * 찜 해제(낙관적 제거) · 장바구니 담기 · 무료 수강은 여기서 처리, 카드는 표시 전담(leaf).
 */
export default function WishlistClient({
  initialItems,
}: {
  initialItems: WishlistCourse[];
}) {
  const [items, setItems] = useState<WishlistCourse[]>(initialItems);

  const patchItem = (courseId: number, patch: Partial<WishlistCourse>) =>
    setItems((list) =>
      list.map((it) => (it.courseId === courseId ? { ...it, ...patch } : it)),
    );

  /** 찜 해제 — 낙관적 제거 후 실패 시 복구 */
  const handleRemove = async (courseId: number) => {
    const prev = items;
    setItems((list) => list.filter((it) => it.courseId !== courseId));
    const res = await removeWishlistAction(courseId);
    if (res.success) {
      toast.success(res.message);
    } else {
      setItems(prev);
      toast.error(res.message);
    }
  };

  /** 장바구니 담기 (유료·미담김) → 담기 후 "장바구니로 가기"로 전환 */
  const handleAddToCart = async (course: WishlistCourse) => {
    const res = await addToCart(course.courseId);
    if (res.success) {
      toast.success(res.message);
      patchItem(course.courseId, { isInCart: true });
    } else {
      toast.error(res.message);
    }
  };

  /** 무료 수강하기 (무료·미수강) → 즉시 수강 후 "학습하기"로 전환 */
  const handleEnroll = async (course: WishlistCourse) => {
    const res = await enrollCourse(course.courseId, 'FREE');
    if (res.success) {
      toast.success(res.message);
      patchItem(course.courseId, { isEnrolled: true });
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      {/* 헤더 (제목 + 총 개수) */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1F2937]">찜한 강의</h1>
        <p className="text-base text-[#4B5563]">총 {items.length}개의 강의</p>
      </div>

      {items.length === 0 ? (
        <WishlistEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((course) => (
            <WishlistCard
              key={course.courseId}
              course={course}
              onRemove={() => handleRemove(course.courseId)}
              onAddToCart={() => handleAddToCart(course)}
              onEnroll={() => handleEnroll(course)}
            />
          ))}
        </div>
      )}
    </>
  );
}
