/**
 * 백엔드 OFF 환경에서 사용할 mock 영상 데이터.
 *
 * durationSeconds는 실제 HLS 영상 길이와 일치시켜 사이드바 시간/진행률/실제 재생 시간이
 * 모두 어긋나지 않게 맞춤. production에서는 백엔드 응답이 그대로 들어옴.
 *
 * 두 강의를 mock으로 제공:
 *  - courseId 1: 2027 수능 수학Ⅱ 미적분 (강의 상세 페이지의 학습하기 진입 시) — videoId 1~9
 *  - courseId 12: React 기초 마스터 (이전부터 직접 URL 테스트용) — videoId 101~502
 */

export interface MockVideoEntry {
  videoId: number;
  courseId: number;
  title: string;
  durationSeconds: number;
  playUrl: string;
  lastPositionSeconds: number;
  isCompleted: boolean;
}

/** 검증된 공개 HLS 샘플 + 실제 영상 길이 */
const SAMPLES = {
  muxBigBuck: { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', duration: 634 },
  appleBipbop: { url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8', duration: 600 },
  muxTest001: { url: 'https://test-streams.mux.dev/test_001/stream.m3u8', duration: 510 },
  akamaiBunny: { url: 'https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8', duration: 596 },
};

/** 비공개 영상 (HTTP 410)
 *  - 수능 수학 섹션 1 마지막 (3)
 *  - React 섹션 4 (402) */
export const PRIVATE_VIDEO_IDS = new Set([3, 402]);
/** 삭제 영상 (HTTP 404)
 *  - 수능 수학 섹션 2 마지막 (6)
 *  - React 섹션 5 (502) */
export const DELETED_VIDEO_IDS = new Set([6, 502]);
/** 영상 불러오기 실패 (HTTP 500)
 *  - 수능 수학 섹션 3 마지막 (9) */
export const ERROR_VIDEO_IDS = new Set([9]);

export const VIDEO_MOCK_MAP: Record<number, MockVideoEntry> = {
  /* ───── courseId 1: 2027 수능 수학Ⅱ 미적분 (강의 상세 페이지와 매칭) ───── */
  /* 섹션 1: 함수의 극한 — lessonId 1, 2 가 미리보기 */
  1: { videoId: 1, courseId: 1, title: 'OT 및 학습 방향', durationSeconds: SAMPLES.muxBigBuck.duration, playUrl: SAMPLES.muxBigBuck.url, lastPositionSeconds: 0, isCompleted: false },
  2: { videoId: 2, courseId: 1, title: '함수의 극한 개념 정리', durationSeconds: SAMPLES.appleBipbop.duration, playUrl: SAMPLES.appleBipbop.url, lastPositionSeconds: 0, isCompleted: false },
  3: { videoId: 3, courseId: 1, title: '극한값 계산 문제풀이 (비공개)', durationSeconds: SAMPLES.muxTest001.duration, playUrl: SAMPLES.muxTest001.url, lastPositionSeconds: 0, isCompleted: false },
  /* 섹션 2: 미분법 */
  4: { videoId: 4, courseId: 1, title: '미분계수와 도함수 기초', durationSeconds: SAMPLES.akamaiBunny.duration, playUrl: SAMPLES.akamaiBunny.url, lastPositionSeconds: 0, isCompleted: false },
  5: { videoId: 5, courseId: 1, title: '합성함수·역함수 미분', durationSeconds: SAMPLES.muxBigBuck.duration, playUrl: SAMPLES.muxBigBuck.url, lastPositionSeconds: 0, isCompleted: false },
  6: { videoId: 6, courseId: 1, title: '이계도함수와 오목·볼록 (삭제)', durationSeconds: SAMPLES.appleBipbop.duration, playUrl: SAMPLES.appleBipbop.url, lastPositionSeconds: 0, isCompleted: false },
  /* 섹션 3: 적분법 */
  7: { videoId: 7, courseId: 1, title: '부정적분과 정적분 완전 정복', durationSeconds: SAMPLES.muxTest001.duration, playUrl: SAMPLES.muxTest001.url, lastPositionSeconds: 0, isCompleted: false },
  8: { videoId: 8, courseId: 1, title: '정적분의 성질과 활용', durationSeconds: SAMPLES.akamaiBunny.duration, playUrl: SAMPLES.akamaiBunny.url, lastPositionSeconds: 0, isCompleted: false },
  9: { videoId: 9, courseId: 1, title: '실전 모의고사 해설 특강 (오류)', durationSeconds: SAMPLES.muxBigBuck.duration, playUrl: SAMPLES.muxBigBuck.url, lastPositionSeconds: 0, isCompleted: false },

  /* ───── courseId 12: React 기초 마스터 (직접 URL 테스트용) ───── */
  /* 섹션 1: React 기초 */
  101: { videoId: 101, courseId: 12, title: 'React 소개', durationSeconds: SAMPLES.muxBigBuck.duration, playUrl: SAMPLES.muxBigBuck.url, lastPositionSeconds: SAMPLES.muxBigBuck.duration, isCompleted: true },
  102: { videoId: 102, courseId: 12, title: 'JSX 문법', durationSeconds: SAMPLES.appleBipbop.duration, playUrl: SAMPLES.appleBipbop.url, lastPositionSeconds: SAMPLES.appleBipbop.duration, isCompleted: true },
  103: { videoId: 103, courseId: 12, title: '컴포넌트 만들기', durationSeconds: SAMPLES.muxTest001.duration, playUrl: SAMPLES.muxTest001.url, lastPositionSeconds: 200, isCompleted: false },
  /* 섹션 2: 상태 관리 */
  201: { videoId: 201, courseId: 12, title: 'useState Hook', durationSeconds: SAMPLES.akamaiBunny.duration, playUrl: SAMPLES.akamaiBunny.url, lastPositionSeconds: 0, isCompleted: false },
  202: { videoId: 202, courseId: 12, title: 'useEffect Hook', durationSeconds: SAMPLES.muxBigBuck.duration, playUrl: SAMPLES.muxBigBuck.url, lastPositionSeconds: 0, isCompleted: false },
  203: { videoId: 203, courseId: 12, title: 'useContext 사용하기', durationSeconds: SAMPLES.appleBipbop.duration, playUrl: SAMPLES.appleBipbop.url, lastPositionSeconds: 0, isCompleted: false },
  /* 섹션 3: 심화 학습 */
  301: { videoId: 301, courseId: 12, title: 'Custom Hooks', durationSeconds: SAMPLES.muxTest001.duration, playUrl: SAMPLES.muxTest001.url, lastPositionSeconds: 0, isCompleted: false },
  302: { videoId: 302, courseId: 12, title: 'Performance 최적화', durationSeconds: SAMPLES.akamaiBunny.duration, playUrl: SAMPLES.akamaiBunny.url, lastPositionSeconds: 0, isCompleted: false },
  /* 섹션 4: 라우팅 (402 = 비공개) */
  401: { videoId: 401, courseId: 12, title: 'React Router 기본', durationSeconds: SAMPLES.muxBigBuck.duration, playUrl: SAMPLES.muxBigBuck.url, lastPositionSeconds: 0, isCompleted: false },
  402: { videoId: 402, courseId: 12, title: '동적 라우팅 (비공개)', durationSeconds: SAMPLES.appleBipbop.duration, playUrl: SAMPLES.appleBipbop.url, lastPositionSeconds: 0, isCompleted: false },
  /* 섹션 5: 배포 (502 = 삭제) */
  501: { videoId: 501, courseId: 12, title: 'Vercel 배포', durationSeconds: SAMPLES.muxTest001.duration, playUrl: SAMPLES.muxTest001.url, lastPositionSeconds: 0, isCompleted: false },
  502: { videoId: 502, courseId: 12, title: 'CI/CD 구축 (삭제됨)', durationSeconds: SAMPLES.akamaiBunny.duration, playUrl: SAMPLES.akamaiBunny.url, lastPositionSeconds: 0, isCompleted: false },
};

/* ───── 강의별 메타 (제목/강사명) — 백엔드 응답에 없는 정보. CourseProgress mock에 포함 ───── */
export const COURSE_META: Record<number, { title: string; instructorName: string }> = {
  1: { title: '2027 수능 수학Ⅱ 미적분 실전 킬러 특강', instructorName: '박지훈' },
  12: { title: 'React 기초 마스터', instructorName: '김리액트' },
};

/* ───── 강의별 영상→섹션 매핑 (사이드바 섹션 분류용) ───── */
export const COURSE_SECTIONS: Record<number, Record<number, string>> = {
  1: {
    1: '섹션 1: 함수의 극한', 2: '섹션 1: 함수의 극한', 3: '섹션 1: 함수의 극한',
    4: '섹션 2: 미분법', 5: '섹션 2: 미분법', 6: '섹션 2: 미분법',
    7: '섹션 3: 적분법', 8: '섹션 3: 적분법', 9: '섹션 3: 적분법',
  },
  12: {
    101: '섹션 1: React 기초', 102: '섹션 1: React 기초', 103: '섹션 1: React 기초',
    201: '섹션 2: 상태 관리', 202: '섹션 2: 상태 관리', 203: '섹션 2: 상태 관리',
    301: '섹션 3: 심화 학습', 302: '섹션 3: 심화 학습',
    401: '섹션 4: 라우팅', 402: '섹션 4: 라우팅',
    501: '섹션 5: 배포', 502: '섹션 5: 배포',
  },
};

/* ───── 강의별 미리보기 가능 영상 ───── */
export const COURSE_PREVIEW_IDS: Record<number, Set<number>> = {
  1: new Set([1, 2]),       // 수능 수학 — OT, 함수의 극한 개념 정리
  12: new Set([101, 201]),  // React — React 소개, useState Hook
};

export function getMockVideoEntry(videoId: number): MockVideoEntry {
  return (
    VIDEO_MOCK_MAP[videoId] ?? {
      videoId,
      courseId: 12,
      title: '샘플 영상',
      durationSeconds: SAMPLES.muxBigBuck.duration,
      playUrl: SAMPLES.muxBigBuck.url,
      lastPositionSeconds: 0,
      isCompleted: false,
    }
  );
}
