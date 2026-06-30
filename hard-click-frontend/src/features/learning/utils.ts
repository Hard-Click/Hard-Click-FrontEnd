/** 영상학습 도메인 공용 유틸 — 커리큘럼 페이지 / 영상 시청 페이지 공유 */
import type { CourseDetail } from '@/features/courses/types';
import type { CourseProgress, SidebarVideoItem } from './types';

/** 초 → "M:SS" */
export function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * 백엔드 progress.lessons + 강의 상세 curriculum (title/section/duration/isPreview) 머지.
 * 강의 상세의 커리큘럼 순서를 유지하며, 진도(완료/마지막 위치)를 lessonId(=videoId) 기준으로 합친다.
 */
export function mergeCurriculumProgress(
  detail: CourseDetail | null,
  progress: CourseProgress | null,
): SidebarVideoItem[] {
  if (!detail) return [];
  const progressMap = new Map<
    number,
    { completed: boolean; lastPositionSeconds: number }
  >();
  progress?.lessons.forEach((l) =>
    progressMap.set(l.videoId, {
      completed: l.completed,
      lastPositionSeconds: l.lastPositionSeconds,
    }),
  );
  const result: SidebarVideoItem[] = [];
  detail.curriculum.forEach((section) => {
    section.lessons.forEach((lesson) => {
      const vid = lesson.videoId ?? lesson.lessonId;
      const lp = progressMap.get(vid);
      const [m, s] = lesson.duration.split(':').map(Number);
      result.push({
        videoId: vid,
        title: lesson.title,
        sectionTitle: section.title,
        durationSeconds: (m ?? 0) * 60 + (s ?? 0),
        completed: lp?.completed ?? false,
        lastPositionSeconds: lp?.lastPositionSeconds ?? 0,
        isPreview: lesson.isPreview,
      });
    });
  });
  return result;
}
