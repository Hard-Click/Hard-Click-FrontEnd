/** 영상학습/진도 도메인 API — 노션 RestAPI 명세 매칭 */
import { api } from '@/services/api';
import {
  getMockVideoEntry,
  VIDEO_MOCK_MAP,
  PRIVATE_VIDEO_IDS,
  DELETED_VIDEO_IDS,
  ERROR_VIDEO_IDS,
  COURSE_META,
  COURSE_SECTIONS,
  COURSE_PREVIEW_IDS,
} from './mocks/videoMockData';
import type {
  VideoPlayInfo,
  WatchTimeRequest,
  WatchTimeResponse,
  CourseProgress,
  VideoProgress,
  CompleteVideoRequest,
  CompleteVideoResponse,
  LastPositionRequest,
  LastPositionResponse,
} from './types';

export const USE_MOCK = true;

/* ───── 강의 영상 재생 정보 조회 (GET /api/learning/videos/{videoId}/play) ─────
 * 401 / 403 (수강 권한 없음) / 404 / 410 (비공개·삭제) / 500 */
export async function getVideoPlayInfo(videoId: number) {
  if (USE_MOCK) {
    /* mock: 비공개/삭제된 영상 처리 */
    if (PRIVATE_VIDEO_IDS.has(videoId)) {
      return {
        success: false,
        httpStatus: 410,
        message: '비공개 처리된 영상입니다.',
        data: undefined as unknown as VideoPlayInfo,
      };
    }
    if (DELETED_VIDEO_IDS.has(videoId)) {
      return {
        success: false,
        httpStatus: 404,
        message: '삭제된 영상입니다.',
        data: undefined as unknown as VideoPlayInfo,
      };
    }
    if (ERROR_VIDEO_IDS.has(videoId)) {
      return {
        success: false,
        httpStatus: 500,
        message: '영상을 불러오지 못했습니다.',
        data: undefined as unknown as VideoPlayInfo,
      };
    }
    return {
      success: true,
      httpStatus: 200,
      message: '영상 재생 정보를 조회했습니다.',
      data: getMockVideoEntry(videoId) as VideoPlayInfo,
    };
  }
  return api.get<VideoPlayInfo>(`/api/learning/videos/${videoId}/play`);
}

/* ───── 영상 시청 시간 저장 (PATCH /api/learning/videos/{videoId}/progress/watch-time) ─────
 * 401 / 403 / 404 / 409 (중복 저장 충돌) / 500 */
export async function saveWatchTime(videoId: number, body: WatchTimeRequest) {
  if (USE_MOCK) {
    /* mock: localStorage 누적 watchedSeconds 기반 progressRate 계산 — 실제 백엔드처럼 동작 */
    let watchedSeconds = 0;
    if (typeof window !== 'undefined') {
      const key = `learning:watchedSeconds:${videoId}`;
      const stored = Number(window.localStorage.getItem(key) || 0);
      watchedSeconds = (Number.isFinite(stored) ? stored : 0);
    }
    const entry = getMockVideoEntry(videoId);
    const progressRate = entry.durationSeconds > 0
      ? Math.min(100, (watchedSeconds / entry.durationSeconds) * 100)
      : 0;
    return {
      success: true,
      httpStatus: 200,
      message: '시청 시간이 저장되었습니다.',
      data: {
        videoId,
        watchedSeconds,
        progressRate,
      } as WatchTimeResponse,
    };
  }
  return api.patch<WatchTimeResponse>(
    `/api/learning/videos/${videoId}/progress/watch-time`,
    body,
  );
}

/* ───── 강의 전체 진도 조회 (GET /api/learning/courses/{courseId}/progress) ─────
 * 401 / 403 / 404 / 500 */
export async function getCourseProgress(courseId: number) {
  if (USE_MOCK) {
    /* mock: VIDEO_MOCK_MAP에서 같은 courseId 영상만 추출. 섹션/미리보기/메타는 별도 매핑 */
    const sectionMap = COURSE_SECTIONS[courseId] ?? {};
    const previewIds = COURSE_PREVIEW_IDS[courseId] ?? new Set<number>();
    const meta = COURSE_META[courseId];

    const filtered = Object.values(VIDEO_MOCK_MAP).filter((v) => v.courseId === courseId);
    const videos = filtered.map((v) => ({
      videoId: v.videoId,
      title: v.title,
      progressRate: v.isCompleted ? 100 : (v.lastPositionSeconds / v.durationSeconds) * 100,
      isCompleted: v.isCompleted,
      sectionTitle: sectionMap[v.videoId] ?? '강의',
      durationSeconds: v.durationSeconds,
      isPreview: previewIds.has(v.videoId),
    }));
    const completedCount = videos.filter((v) => v.isCompleted).length;
    const overall = videos.length > 0
      ? videos.reduce((s, v) => s + v.progressRate, 0) / videos.length
      : 0;

    return {
      success: true,
      httpStatus: 200,
      message: '강의 전체 진도를 조회했습니다.',
      data: {
        courseId,
        /* mock 전용 확장 필드 — 백엔드 명세에는 없음. CourseProgressSummary 표시용 */
        courseTitle: meta?.title,
        instructorName: meta?.instructorName,
        progressRate: overall,
        completedVideoCount: completedCount,
        totalVideoCount: videos.length,
        videos,
      } as CourseProgress,
    };
  }
  return api.get<CourseProgress>(`/api/learning/courses/${courseId}/progress`);
}

/* ───── 단일 영상 진도 조회 (GET /api/learning/videos/{videoId}/progress) ─────
 * 401 / 403 / 404 / 500 */
export async function getVideoProgress(videoId: number) {
  if (USE_MOCK) {
    const entry = getMockVideoEntry(videoId);
    const watchedSec = (() => {
      if (typeof window === 'undefined') return 0;
      const stored = Number(
        window.localStorage.getItem(`learning:watchedSeconds:${videoId}`) || 0,
      );
      return Number.isFinite(stored) ? stored : 0;
    })();
    const progressRate = entry.durationSeconds > 0
      ? Math.min(100, (watchedSec / entry.durationSeconds) * 100)
      : 0;
    return {
      success: true,
      httpStatus: 200,
      message: '영상 진도 정보를 조회했습니다.',
      data: {
        videoId,
        lastPositionSeconds: entry.lastPositionSeconds,
        watchedSeconds: watchedSec,
        durationSeconds: entry.durationSeconds,
        progressRate,
        isCompleted: entry.isCompleted || progressRate >= 90,
      } as VideoProgress,
    };
  }
  return api.get<VideoProgress>(`/api/learning/videos/${videoId}/progress`);
}

/* ───── 영상 완료 처리 (PATCH /api/learning/videos/{videoId}/progress/complete) ─────
 * 90% 이상 시청한 영상에만 호출. 백엔드가 누적 watchedSeconds vs duration*0.9 검증
 * 400 / 401 / 403 / 404 / 409 (완료 기준 미충족) / 500 */
export async function completeVideo(videoId: number, body: CompleteVideoRequest) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '영상 시청 완료 처리되었습니다.',
      data: {
        videoId,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      } as CompleteVideoResponse,
    };
  }
  return api.patch<CompleteVideoResponse>(
    `/api/learning/videos/${videoId}/progress/complete`,
    body,
  );
}

/* ───── 마지막 재생 위치 저장 (PATCH /api/learning/videos/{videoId}/progress/position) ─────
 * 정지/이탈 시점에 호출. body { lastPositionSeconds } 필수.
 * 400 (음수·형식 오류) / 401 / 403 / 404 / 500 */
export async function saveLastPosition(
  videoId: number,
  body: LastPositionRequest,
) {
  if (USE_MOCK) {
    /* mock: localStorage에 저장하고 명세 응답 형태 그대로 반환 */
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `learning:lastPosition:${videoId}`,
        String(body.lastPositionSeconds),
      );
    }
    return {
      success: true,
      httpStatus: 200,
      message: '마지막 재생 위치가 저장되었습니다.',
      data: {
        videoId,
        lastPositionSeconds: body.lastPositionSeconds,
        savedAt: new Date().toISOString(),
      } as LastPositionResponse,
    };
  }
  return api.patch<LastPositionResponse>(
    `/api/learning/videos/${videoId}/progress/position`,
    body,
  );
}
