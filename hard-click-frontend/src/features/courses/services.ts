import type {
  CourseDetail,
  CourseDetailApiResponse,
} from './types';
import { api } from '@/services/api';
import { isMock } from '@/mocks/config';
import {
  mockCourseListResponse,
  mockCourseDetailResponse,
} from '@/mocks/courses.mock';
import { mockReviewListResponse } from '@/mocks/reviews.mock';
import { subjectLabel } from './subjects';

function formatTotalDuration(totalSecs: number): string {
  if (totalSecs <= 0) return '0분';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분`;
  return `${s}초`;
}

/** 초 → "MM:SS" */
function formatLessonDuration(seconds: number | null): string {
  const total = seconds ?? 0;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** 백엔드 상세 응답(sections/lessons) → UI CourseDetail */
export function toCourseDetail(data: CourseDetailApiResponse): CourseDetail {
  const sections = data.sections ?? [];
  const allLessons = sections.flatMap((s) => s.lessons);
  const totalSeconds = allLessons.reduce(
    (sum, l) => sum + (l.durationSeconds ?? 0),
    0
  );

  return {
    courseId: data.courseId,
    title: data.title,
    description: data.description,
    subjectName: subjectLabel(data.subjectName), // BE raw enum 이름 → 한글 라벨
    instructorName: data.instructorName,
    price: data.price,
    isFree: data.priceType === 'FREE',
    thumbnailUrl: data.thumbnailUrl,
    averageRating: data.averageRating,
    reviewCount: data.reviewCount,
    studentCount: data.studentCount,
    status: data.status,
    isEnrolled: false, // 별도 권한 확인 API
    isWishlisted: false,
    isInCart: false,
    learningGoals: data.learningObjectives ?? [],
    targetAudience: data.targetAudience ?? [],
    techTags: data.techTags ?? [],
    materialsProvided: [], // 백엔드 상세 응답 미제공
    level: data.level,
    totalLessons: allLessons.length,
    totalDuration: formatTotalDuration(totalSeconds),
    notices: [], // 별도 API: 강의 공지 목록
    // ⚠️ 생성 요청에만 있는 필드 — 상세 응답·수정 요청 미제공 → 조회 시 항상 null. BE가 CourseDetailResponse에 추가하면 값이 흐른다.
    recommendedWeeks: data.recommendedWeeks ?? null,
    dailyMaxMinutes: data.dailyMaxMinutes ?? null,
    instructor: {
      instructorId: 0, // 상세 응답에 instructorId 없음(강사명만 제공)
      name: data.instructorName,
      subtitle: data.instructorOneLineIntro ?? '', // BE 시드 전엔 null → 빈 문자열
      bio: data.instructorIntroduction ?? '',
      // BE career는 단일 string — 줄바꿈으로 분리해 항목 배열로 (BE가 다른 구분자면 조정)
      career: data.instructorCareer
        ? data.instructorCareer
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      tags: data.techTags ?? [],
      instructorStudentCount: data.instructorStudentCount,
      instructorCourseCount: data.instructorCourseCount,
      instructorRating: data.instructorRating,
    },
    curriculum: sections.map((s) => ({
      sectionId: s.sectionId,
      title: s.title,
      lessons: s.lessons.map((l) => ({
        lessonId: l.lessonId,
        videoId: l.videoId ?? l.lessonId,
        title: l.title,
        duration: formatLessonDuration(l.durationSeconds),
        isPreview: l.isPreview,
      })),
    })),
    reviews: isMock('reviews')
      ? mockReviewListResponse.reviews.map((r) => ({
          reviewId: r.reviewId,
          studentName: r.authorName,
          rating: r.rating,
          content: r.content,
          createdAt: r.createdDate,
          isMine: r.isMyReview,
        }))
      : [],
    ratingDistribution: [],
  };
}

export async function getCourseDetail(
  courseId: number
): Promise<CourseDetail | null> {
  if (isMock('courses')) {
    return toCourseDetail({ ...mockCourseDetailResponse, courseId });
  }
  const response = await api.get<CourseDetailApiResponse>(
    `/api/courses/${courseId}`
  );
  if (!response.success || !response.data) return null;
  return toCourseDetail(response.data);
}

/** 강사 목록 — 백엔드 미지원, 목 강의 데이터에서 파생 */
export function getInstructors(): string[] {
  return Array.from(
    new Set(mockCourseListResponse.content.map((c) => c.instructorName))
  ).sort();
}
