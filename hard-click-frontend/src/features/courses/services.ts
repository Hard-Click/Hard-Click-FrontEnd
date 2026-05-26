import type {
  CourseListItem,
  Subject,
  CourseListQuery,
  CourseDetail,
} from './types';

export const MOCK_SUBJECTS: Subject[] = [
  { subjectId: 1, name: '국어' },
  { subjectId: 2, name: '수학Ⅰ' },
  { subjectId: 3, name: '수학Ⅱ' },
  { subjectId: 4, name: '영어' },
  { subjectId: 5, name: '한국사' },
  { subjectId: 6, name: '물리학Ⅰ' },
  { subjectId: 7, name: '화학Ⅰ' },
  { subjectId: 8, name: '생명과학Ⅰ' },
  { subjectId: 9, name: '지구과학Ⅰ' },
  { subjectId: 10, name: '사회문화' },
  { subjectId: 11, name: '생활과 윤리' },
  { subjectId: 12, name: '한국지리' },
  { subjectId: 13, name: '세계지리' },
  { subjectId: 14, name: '정치와 법' },
  { subjectId: 15, name: '경제' },
];

export const MOCK_COURSES: CourseListItem[] = [
  {
    courseId: 1,
    title: '2027 수능 수학Ⅱ 미적분 실전 킬러 특강',
    instructorName: '박지훈',
    subjectName: '수학Ⅱ',
    price: 89000,
    averageRating: 4.8,
    reviewCount: 1234,
    studentCount: 12543,
    status: 'PUBLISHED',
    createdAt: '2026-01-15',
    isFree: false,
    isEnrolled: false,
    hasPreview: true,
    thumbnailUrl: '/image/lecture1.svg',
  },
  {
    courseId: 2,
    title: '국어 독서 지문 분석과 빈칸 추론 완성',
    instructorName: '김민정',
    subjectName: '국어',
    price: 75000,
    averageRating: 4.9,
    reviewCount: 856,
    studentCount: 8932,
    status: 'PUBLISHED',
    createdAt: '2026-02-01',
    isFree: false,
    isEnrolled: false,
    hasPreview: true,
    thumbnailUrl: '/image/lecture2.svg',
  },
  {
    courseId: 3,
    title: '생명과학Ⅰ 유전 킬러 정복 + 실전 모의고사',
    instructorName: '최현우',
    subjectName: '생명과학Ⅰ',
    price: 0,
    averageRating: 4.7,
    reviewCount: 643,
    studentCount: 6721,
    status: 'PUBLISHED',
    createdAt: '2026-01-20',
    isFree: true,
    isEnrolled: false,
    hasPreview: false,
    thumbnailUrl: '/image/lecture3.svg',
  },
  {
    courseId: 4,
    title: '영어 빈칸추론 집중 훈련 - 1등급 완성',
    instructorName: '이서연',
    subjectName: '영어',
    price: 79000,
    averageRating: 4.6,
    reviewCount: 1523,
    studentCount: 15234,
    status: 'PUBLISHED',
    createdAt: '2026-02-10',
    isFree: false,
    isEnrolled: false,
    hasPreview: true,
    thumbnailUrl: '/image/lecture4.svg',
  },
  {
    courseId: 5,
    title: '2027 수능 수학Ⅱ 확률과 통계 집중 특강',
    instructorName: '박지훈',
    subjectName: '수학Ⅱ',
    price: 65000,
    averageRating: 4.7,
    reviewCount: 892,
    studentCount: 9234,
    status: 'PUBLISHED',
    createdAt: '2026-03-01',
    isFree: false,
    isEnrolled: false,
    hasPreview: true,
    thumbnailUrl: '/image/lecture5.svg',
  },
  {
    courseId: 6,
    title: '수학Ⅰ 수열과 극한 완전 정복',
    instructorName: '박지훈',
    subjectName: '수학Ⅰ',
    price: 55000,
    averageRating: 4.9,
    reviewCount: 1102,
    studentCount: 11320,
    status: 'PUBLISHED',
    createdAt: '2026-03-15',
    isFree: false,
    isEnrolled: false,
    hasPreview: true,
    thumbnailUrl: '/image/lecture6.svg',
  },
  {
    courseId: 7,
    title: '수학Ⅱ 미분 기초부터 실전까지',
    instructorName: '박지훈',
    subjectName: '수학Ⅱ',
    price: 0,
    averageRating: 4.6,
    reviewCount: 543,
    studentCount: 5421,
    status: 'PUBLISHED',
    createdAt: '2026-04-01',
    isFree: true,
    isEnrolled: false,
    hasPreview: false,
    thumbnailUrl: '/image/lecture7.svg',
  },
];

/* ── Mock Course Detail ── */
const MOCK_COURSE_DETAIL: CourseDetail = {
  courseId: 1,
  title: '2027 수능 수학Ⅱ 미적분 실전 킬러 특강',
  description:
    '수능 수학Ⅱ 미적분 단원의 킬러 문제를 완전 정복하는 실전 특강입니다. 함수의 극한부터 미분·적분 심화 문제까지, 실제 수능 출제 패턴을 분석하여 체계적으로 학습합니다.',
  subjectName: '수학Ⅱ',
  instructorName: '박지훈',
  price: 89000,
  isFree: false,
  thumbnailUrl: '/image/lecture1.svg',
  averageRating: 4.8,
  reviewCount: 1234,
  studentCount: 12543,
  status: 'PUBLISHED',
  isEnrolled: false,
  isWishlisted: false,
  isInCart: false,
  learningGoals: [
    '미분·적분 킬러 문제 유형을 완전히 파악하고 풀이할 수 있다',
    '함수의 극한과 연속 개념을 실전에 적용할 수 있다',
    '수능 수학Ⅱ 1등급을 위한 실전 감각을 기를 수 있다',
    '빠른 계산과 정확한 풀이 전략을 습득한다',
  ],
  targetAudience: [
    '수능 수학Ⅱ에서 3~4등급이며 1등급을 목표로 하는 수험생',
    '미적분 킬러 문제에서 자꾸 막히는 학생',
    '수학Ⅱ 전 범위를 빠르게 완성하고 싶은 학생',
  ],
  techTags: ['함수의 극한', '연속함수', '미분법', '적분법', '급수'],
  materialsProvided: ['강의 PDF', '연습 문제집', '기출 분석 자료', '실전 모의고사 5회'],
  level: '중급~고급',
  totalLessons: 42,
  totalDuration: '38시간 20분',
  notices: [
    { noticeId: 1, title: '6월 모의고사 대비 특별 추가 강의 업로드 안내', content: '6월 모의고사 대비 특별 추가 강의가 업로드되었습니다. 수강생 여러분께서는 강의 목록에서 확인하세요.', createdAt: '2026-05-20', isPinned: true },
    { noticeId: 2, title: '5월 오답풀이 라이브 일정 변경 안내', content: '5월 오답풀이 라이브 강의 일정이 5월 28일로 변경되었습니다. 참고 부탁드립니다.', createdAt: '2026-05-10' },
    { noticeId: 4, title: '5월 특별 할인 이벤트 안내', content: '5월 한 달 동안 모든 강의 30% 할인 진행 중입니다!', createdAt: '2026-05-01' },
    { noticeId: 3, title: '강의 자료 v2.1 업데이트 완료', content: '강의 자료 PDF가 v2.1로 업데이트되었습니다. 마이페이지 자료실에서 다시 다운로드해 주세요.', createdAt: '2026-04-28' },
    { noticeId: 5, title: 'Q&A 게시판 운영 안내', content: '궁금한 점은 Q&A 게시판에 남겨주시면 24시간 내 답변드립니다.', createdAt: '2026-04-20' },
  ],
  instructor: {
    instructorId: 1,
    name: '박지훈',
    subtitle: '수능 수학 전문 강사',
    bio: '현 FLOWN 수학Ⅱ 전임 강사. 수능 수학 1등급 배출 전문 강사로, 10년 이상의 강의 경력을 보유하고 있습니다. 어려운 수학 개념도 직관적으로 이해할 수 있도록 돕는 것이 강의 철학입니다.',
    career: [
      '現 FLOWN 수학Ⅱ 전임 강사',
      '前 대치동 대형 학원 수학 강사 (8년)',
      '연세대학교 수학과 졸업',
      '수능 수학 만점자 배출 다수',
    ],
    tags: ['수학Ⅱ', '수학Ⅰ', '미적분', '확률과 통계'],
    instructorStudentCount: 42800,
    instructorCourseCount: 7,
    instructorRating: 4.9,
  },
  curriculum: [
    {
      sectionId: 1,
      title: '섹션 1: 함수의 극한',
      lessons: [
        { lessonId: 1, title: 'OT 및 학습 방향', duration: '05:23', isPreview: true },
        { lessonId: 2, title: '함수의 극한 개념 정리', duration: '12:45', isPreview: true },
        { lessonId: 3, title: '극한값 계산 문제풀이', duration: '18:30', isPreview: false },
      ],
    },
    {
      sectionId: 2,
      title: '섹션 2: 미분법',
      lessons: [
        { lessonId: 4, title: '미분계수와 도함수 기초', duration: '40:00', isPreview: false },
        { lessonId: 5, title: '합성함수·역함수 미분', duration: '44:30', isPreview: false },
        { lessonId: 6, title: '이계도함수와 오목·볼록', duration: '33:15', isPreview: false },
      ],
    },
    {
      sectionId: 3,
      title: '섹션 3: 적분법',
      lessons: [
        { lessonId: 7, title: '부정적분과 정적분 완전 정복', duration: '45:00', isPreview: false },
        { lessonId: 8, title: '정적분의 성질과 활용', duration: '39:50', isPreview: false },
        { lessonId: 9, title: '실전 모의고사 해설 특강', duration: '90:00', isPreview: false },
      ],
    },
  ],
  reviews: [
    {
      reviewId: 1,
      studentName: '김*현',
      rating: 5,
      content:
        '정말 최고의 강의입니다. 킬러 문제 접근법이 너무 명쾌해서 드디어 제대로 이해했어요. 모의고사 성적이 3등급에서 1등급으로 올랐습니다!',
      createdAt: '2026-05-15',
      isMine: false,
    },
    {
      reviewId: 2,
      studentName: '이*준',
      rating: 5,
      content:
        '박지훈 강사님 수업 방식이 정말 체계적입니다. PDF 자료도 잘 정리되어 있고 문제 풀이 과정 설명이 굉장히 친절해요.',
      createdAt: '2026-05-10',
      isMine: false,
    },
    {
      reviewId: 3,
      studentName: '박*서',
      rating: 4,
      content:
        '전반적으로 좋은 강의입니다. 특히 2단원 미분법 킬러 파트가 인상적이었어요. 다음에도 수강할 것 같습니다.',
      createdAt: '2026-05-01',
      isMine: true,
    },
    {
      reviewId: 4,
      studentName: '최*은',
      rating: 5,
      content:
        '수능 전 마지막으로 수강했는데 정말 잘한 선택이었어요. 킬러 문항 유형별 접근법이 완벽하게 정리돼 있어서 실전에서 바로 써먹을 수 있었습니다.',
      createdAt: '2026-04-28',
      isMine: false,
    },
    {
      reviewId: 5,
      studentName: '정*우',
      rating: 4,
      content:
        '설명이 정말 친절하고 PDF 자료 퀄리티가 높아요. 강의 속도가 살짝 빠른 편이라 일시정지하면서 따라가야 했지만 내용 자체는 최상입니다.',
      createdAt: '2026-04-20',
      isMine: false,
    },
    {
      reviewId: 6,
      studentName: '한*아',
      rating: 5,
      content:
        '미적분 개념부터 킬러까지 완벽하게 커버해줘서 좋았어요. 기출 분석 자료가 특히 유용했고 질문 게시판 답변도 빠릅니다.',
      createdAt: '2026-04-15',
      isMine: false,
    },
    {
      reviewId: 7,
      studentName: '오*진',
      rating: 3,
      content:
        '킬러 문항 접근법이 체계적이에요. 다만 난이도가 높아서 기초가 부족하면 어려울 수 있어요. 개념 강의를 먼저 듣고 오는 것을 추천합니다.',
      createdAt: '2026-04-10',
      isMine: false,
    },
    {
      reviewId: 8,
      studentName: '강*민',
      rating: 5,
      content:
        '3년째 박지훈 강사님 강의 듣고 있는데 이번 강의가 역대급입니다. 특히 수열 극한 파트 풀이가 정말 깔끔하고 효율적이에요.',
      createdAt: '2026-04-05',
      isMine: false,
    },
    {
      reviewId: 9,
      studentName: '윤*희',
      rating: 5,
      content:
        '모의고사 5회분 포함이라 가성비가 정말 좋아요. 강의 내용도 충실하고 복습하기 좋게 구성돼 있어서 반복 수강 중입니다.',
      createdAt: '2026-03-28',
      isMine: false,
    },
    {
      reviewId: 10,
      studentName: '임*호',
      rating: 4,
      content:
        '강의 구성이 매우 논리적이에요. 개념 → 예제 → 킬러 순서로 진행되는 흐름이 이해하기 좋습니다. 강의 시간 대비 학습 효율이 높아요.',
      createdAt: '2026-03-20',
      isMine: false,
    },
    {
      reviewId: 11,
      studentName: '서*연',
      rating: 5,
      content:
        '드디어 미적분 킬러 풀 수 있게 됐어요! 강사님이 핵심만 짚어주셔서 시간 낭비 없이 공부할 수 있었습니다. 강추합니다.',
      createdAt: '2026-03-15',
      isMine: false,
    },
    {
      reviewId: 12,
      studentName: '남*찬',
      rating: 4,
      content:
        '강의 퀄리티는 정말 좋은데 자막이 없어서 조금 아쉬웠어요. 그래도 설명이 명확해서 따라가는 데 무리는 없었습니다.',
      createdAt: '2026-03-08',
      isMine: false,
    },
    {
      reviewId: 13,
      studentName: '전*영',
      rating: 5,
      content:
        '작년에 이 강의 듣고 수능 수학 1등급 받았습니다. 올해 동생한테도 추천해줬어요. 박지훈 선생님 강의는 믿고 듣습니다.',
      createdAt: '2026-03-01',
      isMine: false,
    },
  ],
  ratingDistribution: [
    { stars: 5, count: 890 },
    { stars: 4, count: 245 },
    { stars: 3, count: 68 },
    { stars: 2, count: 20 },
    { stars: 1, count: 11 },
  ],
};

export async function getCourseDetail(courseId: number): Promise<CourseDetail | null> {
  // TODO: Replace with real API — GET /api/courses/:courseId
  await new Promise(resolve => setTimeout(resolve, 200));
  if (courseId === 1) return MOCK_COURSE_DETAIL;
  // mock: 삭제된 강의 (courseId=4)
  if (courseId === 4) return { ...MOCK_COURSE_DETAIL, courseId: 4, status: 'DELETED' };
  // mock: 접근 불가 강의 (courseId=5)
  if (courseId === 5) return { ...MOCK_COURSE_DETAIL, courseId: 5, status: 'HIDDEN' };
  // mock: 수강평 없는 강의 (courseId=6)
  if (courseId === 6) return { ...MOCK_COURSE_DETAIL, courseId: 6, reviews: [], reviewCount: 0, ratingDistribution: [] };
  // For other IDs, derive from the list as a minimal fallback
  const item = MOCK_COURSES.find(c => c.courseId === courseId);
  if (!item) return null;
  return { ...MOCK_COURSE_DETAIL, ...item, description: MOCK_COURSE_DETAIL.description };
}

export async function getCourses(query?: CourseListQuery): Promise<CourseListItem[]> {
  // TODO: Replace with real API — GET /api/courses
  await new Promise(resolve => setTimeout(resolve, 200));

  let courses = MOCK_COURSES.filter(c => c.status === 'PUBLISHED');

  if (query?.keyword) {
    const kw = query.keyword.toLowerCase();
    courses = courses.filter(c => c.title.toLowerCase().includes(kw));
  }

  if (query?.subjectId) {
    const subject = MOCK_SUBJECTS.find(s => s.subjectId === query.subjectId);
    if (subject) courses = courses.filter(c => c.subjectName === subject.name);
  }

  if (query?.instructor) {
    courses = courses.filter(c => c.instructorName === query.instructor);
  }

  const sort = query?.sort ?? 'latest';
  const sorted = [...courses];
  if (sort === 'latest') {
    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'popular') {
    sorted.sort((a, b) => b.studentCount - a.studentCount);
  } else if (sort === 'rating') {
    sorted.sort((a, b) => b.averageRating - a.averageRating);
  }

  return sorted;
}

export async function getSubjects(): Promise<Subject[]> {
  // TODO: Replace with real API — GET /api/subjects
  return MOCK_SUBJECTS;
}

export function getInstructors(): string[] {
  return Array.from(
    new Set(MOCK_COURSES.filter(c => c.status === 'PUBLISHED').map(c => c.instructorName))
  ).sort();
}
