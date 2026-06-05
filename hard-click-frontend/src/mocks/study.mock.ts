/**
 * 스터디 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/study, GET /api/study/{groupId}
 */

export interface StudyListApiItem {
  groupId: number;
  title: string;
  content: string;
  authorName: string;
  subjectName: string;
  currentCount: number;
  maxCount: number;
  isClosed: boolean;
  createdAt: string;
}

export interface StudyListApiResponse {
  content: StudyListApiItem[];
  totalPages: number;
}

export interface StudyDetailApiResponse {
  groupId: number;
  title: string;
  content: string;
  subjectName: string;
  authorName: string;
  currentCount: number;
  maxCount: number;
  isMine: boolean;
  isJoined: boolean;
  isClosed: boolean;
  members: string[];
  createdAt: string;
}

export const mockStudyListResponse: StudyListApiResponse = {
  content: [
    {
      groupId: 101,
      title: '주말 React 스터디 모집',
      content: '강남 카페에서 진행합니다',
      authorName: '최*진',
      subjectName: 'React',
      currentCount: 3,
      maxCount: 6,
      isClosed: false,
      createdAt: '2026-05-17T14:30:00',
    },
  ],
  totalPages: 5,
};

export const mockStudyDetail: StudyDetailApiResponse = {
  groupId: 42,
  title: '수학 1등급 목표 스터디',
  content: '매주 일요일 밤 10시에 모여서 질문 받습니다.',
  subjectName: '수학1',
  authorName: '이*연',
  currentCount: 2,
  maxCount: 5,
  isMine: false,
  isJoined: true,
  isClosed: false,
  members: ['이*연', '김*민'],
  createdAt: '2026-05-18T17:00:00',
};
