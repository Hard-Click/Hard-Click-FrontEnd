/** 영상학습/진도 도메인 API — 백엔드 controller 매칭
 *  base: /api/learning */
import { isMock } from '@/mocks/config';
import { api } from '@/services/api';
import {
  getMockVideoEntry,
  VIDEO_MOCK_MAP,
  PRIVATE_VIDEO_IDS,
  DELETED_VIDEO_IDS,
  ERROR_VIDEO_IDS,
} from './mocks/videoMockData';
import type {
  VideoPlayInfo,
  WatchTimeRequest,
  CourseProgress,
  CourseProgressLesson,
  VideoProgress,
  LastPositionRequest,
  PositionInfo,
} from './types';

/* ───── 강의 영상 재생 정보 조회 (GET /api/learning/videos/{videoId}/play) ─────
 * BE 실제 에러: 403 L002(비공개 강의)·403 L003(수강권 없음) / 404 L001(영상 없음)·404 L005(재생 URL 없음) / 401 / 500.
 * (BE엔 410 경로 없음 — mock 코드를 BE 실제값에 맞춤.) */
export async function getVideoPlayInfo(videoId: number) {
  if (isMock('learning')) {
    if (PRIVATE_VIDEO_IDS.has(videoId)) {
      return {
        success: false,
        httpStatus: 403, // L002 비공개 강의
        message: '비공개 처리된 강의입니다.',
        data: undefined as unknown as VideoPlayInfo,
      };
    }
    if (DELETED_VIDEO_IDS.has(videoId)) {
      return {
        success: false,
        httpStatus: 404, // L001 존재하지 않는 영상
        message: '존재하지 않는 영상입니다.',
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
    const entry = getMockVideoEntry(videoId);
    return {
      success: true,
      httpStatus: 200,
      message: '영상 재생 정보를 조회했습니다.',
      data: {
        videoId: entry.videoId,
        courseId: entry.courseId,
        streamingUrl: entry.playUrl,
        durationSeconds: entry.durationSeconds,
        lastPositionSec: entry.lastPositionSeconds,
        watchTimeSec: 0,
        completed: entry.isCompleted,
      } as VideoPlayInfo,
    };
  }
  return api.get<VideoPlayInfo>(`/api/learning/videos/${videoId}/play`);
}

/* ───── 영상 시청 시간 누적 (PATCH /api/learning/videos/{videoId}/progress/watch-time) ─────
 * body { watchTimeSeconds }. Response: void
 * 400 / 401 / 403 / 404 / 500 */
export async function saveWatchTime(videoId: number, body: WatchTimeRequest) {
  if (isMock('learning')) {
    if (typeof window !== 'undefined') {
      const key = `learning:watchedSeconds:${videoId}`;
      const stored = Number(window.localStorage.getItem(key) || 0);
      const next = (Number.isFinite(stored) ? stored : 0) + body.watchTimeSeconds;
      window.localStorage.setItem(key, String(next));
    }
    return {
      success: true,
      httpStatus: 200,
      message: '시청 시간이 저장되었습니다.',
      data: undefined as unknown as void,
    };
  }
  return api.patch<void>(
    `/api/learning/videos/${videoId}/progress/watch-time`,
    body,
  );
}

/* ───── 마지막 재생 위치 저장 (PATCH /api/learning/videos/{videoId}/progress/position) ─────
 * body { positionSeconds }. Response: void
 * 400 (음수·형식 오류) / 401 / 403 / 404 / 500 */
export async function saveLastPosition(
  videoId: number,
  body: LastPositionRequest,
) {
  if (isMock('learning')) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `learning:lastPosition:${videoId}`,
        String(body.positionSeconds),
      );
    }
    return {
      success: true,
      httpStatus: 200,
      message: '마지막 재생 위치가 저장되었습니다.',
      data: undefined as unknown as void,
    };
  }
  return api.patch<void>(
    `/api/learning/videos/${videoId}/progress/position`,
    body,
  );
}

/* ───── 이어보기 위치 조회 (GET /api/learning/videos/{videoId}/progress/position) ───── */
export async function getLastPosition(videoId: number) {
  if (isMock('learning')) {
    const entry = getMockVideoEntry(videoId);
    let pos = entry.lastPositionSeconds;
    if (typeof window !== 'undefined') {
      const stored = Number(
        window.localStorage.getItem(`learning:lastPosition:${videoId}`) || 0,
      );
      if (Number.isFinite(stored) && stored > 0) pos = stored;
    }
    return {
      success: true,
      httpStatus: 200,
      message: '이어보기 위치를 조회했습니다.',
      data: { videoId, positionSeconds: pos } as PositionInfo,
    };
  }
  return api.get<PositionInfo>(
    `/api/learning/videos/${videoId}/progress/position`,
  );
}

/* ───── 단일 영상 진도 조회 (GET /api/learning/videos/{videoId}/progress) ─────
 * 401 / 403 / 404 / 500 */
export async function getVideoProgress(videoId: number) {
  if (isMock('learning')) {
    const entry = getMockVideoEntry(videoId);
    const watchTimeSec = (() => {
      if (typeof window === 'undefined') return 0;
      const stored = Number(
        window.localStorage.getItem(`learning:watchedSeconds:${videoId}`) || 0,
      );
      return Number.isFinite(stored) ? stored : 0;
    })();
    const completed =
      entry.isCompleted ||
      (entry.durationSeconds > 0 &&
        watchTimeSec >= Math.ceil(entry.durationSeconds * 0.9));
    const progressRate = entry.durationSeconds > 0
      ? Math.min(100, Math.round((watchTimeSec / entry.durationSeconds) * 100))
      : 0;
    return {
      success: true,
      httpStatus: 200,
      message: '영상 진도 정보를 조회했습니다.',
      data: {
        videoId,
        lastPositionSeconds: entry.lastPositionSeconds,
        watchTimeSeconds: watchTimeSec,
        durationSeconds: entry.durationSeconds,
        progressRate,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      } as VideoProgress,
    };
  }
  return api.get<VideoProgress>(`/api/learning/videos/${videoId}/progress`);
}

/* ───── 영상 완료 처리 (PATCH /api/learning/videos/{videoId}/progress/complete) ─────
 * Request: body 없음. Response: void
 * 백엔드 검증: watchTimeSeconds >= ceil(durationSeconds * 0.9). 미충족 시 **409 CONFLICT / errorCode L004**
 *   (VIDEO_COMPLETION_CONDITION_NOT_MET) — 라이브 전환 시 호출부에서 409/L004를 "90% 시청 후 완료" 안내로 처리.
 * 400 / 401 / 403 / 404 / 409(L004) / 500 */
export async function completeVideo(videoId: number) {
  if (isMock('learning')) {
    return {
      success: true,
      httpStatus: 200,
      message: '영상 시청 완료 처리되었습니다.',
      data: undefined as unknown as void,
    };
  }
  return api.patch<void>(
    `/api/learning/videos/${videoId}/progress/complete`,
  );
}

/* ───── 강의 전체 진도 조회 (GET /api/learning/courses/{courseId}/progress) ─────
 * 401 / 403 / 404 / 500 */
export async function getCourseProgress(courseId: number) {
  if (isMock('learning')) {
    const filtered = Object.values(VIDEO_MOCK_MAP).filter(
      (v) => v.courseId === courseId,
    );
    const lessons: CourseProgressLesson[] = filtered.map((v) => ({
      videoId: v.videoId,
      completed: v.isCompleted,
      lastPositionSeconds: v.lastPositionSeconds,
    }));
    const completedCount = lessons.filter((l) => l.completed).length;
    const progressRate = lessons.length > 0
      ? (completedCount / lessons.length) * 100
      : 0;

    return {
      success: true,
      httpStatus: 200,
      message: '강의 전체 진도를 조회했습니다.',
      data: {
        courseId,
        progressRate,
        completedLessonCount: completedCount,
        totalLessonCount: lessons.length,
        lessons,
      } as CourseProgress,
    };
  }
  return api.get<CourseProgress>(`/api/learning/courses/${courseId}/progress`);
}
