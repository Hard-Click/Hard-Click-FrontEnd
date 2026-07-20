export type CourseStatus = 'PUBLISHED' | 'DRAFT' | 'HIDDEN' | 'DELETED';
export type CourseSortType = 'latest' | 'popular' | 'rating';

export interface CourseListItem {
  courseId: number;
  title: string;
  instructorName: string;
  subjectName: string;
  price: number;
  thumbnailUrl?: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  status: CourseStatus;
  createdAt: string;
  isFree: boolean;
  isEnrolled?: boolean;
  hasPreview?: boolean;
}

export interface Subject {
  subjectId: number;
  name: string;
}

export interface CourseListQuery {
  keyword?: string;
  subjectId?: number;
  instructor?: string;
  sort?: CourseSortType;
}

/* ── Course Detail ── */

export interface CourseNotice {
  noticeId: number;
  title: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface InstructorProfile {
  instructorId: number;
  name: string;
  subtitle: string;
  bio: string;
  career: string[];
  tags: string[];
  instructorStudentCount: number;
  instructorCourseCount: number;
  instructorRating: number;
}

export interface CurriculumLesson {
  lessonId: number;
  /** 재생/진도 API용 영상 ID (현재 lessonId와 동일). 학습 경로/진도 매칭에 사용. */
  videoId?: number;
  title: string;
  duration: string; // "MM:SS"
  isPreview: boolean;
}

export interface CurriculumSection {
  sectionId: number;
  title: string;
  lessons: CurriculumLesson[];
}

export interface Review {
  reviewId: number;
  studentName: string;
  rating: number; // 1–5 (whole numbers)
  content: string;
  createdAt: string;
  isMine: boolean;
}

export interface CourseDetail {
  courseId: number;
  title: string;
  description: string;
  subjectName: string;
  instructorName: string;
  price: number;
  isFree: boolean;
  thumbnailUrl?: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  status: CourseStatus;
  isEnrolled: boolean;
  isWishlisted: boolean;
  isInCart: boolean;
  learningGoals: string[];
  targetAudience: string[];
  techTags: string[];
  materialsProvided: string[];
  level: string;
  totalLessons: number;
  totalDuration: string;
  notices: CourseNotice[];
  instructor: InstructorProfile;
  curriculum: CurriculumSection[];
  reviews: Review[];
  ratingDistribution: { stars: number; count: number }[];
  /** 권장 완강 기간(주). ⚠️ BE 상세 응답 미제공 → 조회 시 현재 항상 null(수정 프리필도 빈칸). BE가 CourseDetailResponse에 추가하면 값이 채워진다. */
  recommendedWeeks: number | null;
  /** 하루 학습 상한(분). ⚠️ 위와 동일 — BE 상세 응답 미제공 → 조회 시 항상 null. */
  dailyMaxMinutes: number | null;
}

/* ───── 백엔드 응답 (실제 Hard-Click-BackEnd 코드 DTO 기준) ───── */

export type PriceType = 'FREE' | 'PAID';
export type ApiCourseStatus = 'DRAFT' | 'PUBLISHED' | 'DELETED' | 'HIDDEN';

// GET /api/subjects → List<SubjectResponse>
export interface SubjectApiItem {
  subjectId: number;
  subjectName: string;
}

// GET /api/courses → CourseListResponse.content[] (CourseListItemResponse)
export interface CourseListApiItem {
  courseId: number;
  title: string;
  subjectName: string;
  thumbnailUrl: string;
  priceLabel: string; // "무료" | "89,000원"
  priceType: PriceType;
  price: number;
  instructorName: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  createdAt: string; // Instant
  status: ApiCourseStatus;
}

// GET /api/courses → CourseListResponse
export interface CourseListApiResponse {
  content: CourseListApiItem[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

// GET /api/courses/{courseId} → CourseDetailResponse.sections[].lessons[]
export interface CourseLessonApiItem {
  lessonId: number;
  /** 재생/진도 API용 영상 ID (BE main부터 제공, 현재 lessonId와 동일). 미제공 시 lessonId로 폴백. */
  videoId?: number;
  title: string;
  description: string;
  orderIndex: number;
  durationSeconds: number | null;
  isPreview: boolean;
}

// GET /api/courses/{courseId} → CourseDetailResponse.sections[]
export interface CourseSectionApiItem {
  sectionId: number;
  title: string;
  orderIndex: number;
  lessons: CourseLessonApiItem[];
}

// GET /api/courses/{courseId} → CourseDetailResponse
export interface CourseDetailApiResponse {
  courseId: number;
  title: string;
  subjectName: string;
  description: string;
  thumbnailUrl: string;
  priceType: PriceType;
  price: number;
  priceLabel: string;
  status: ApiCourseStatus;
  instructorName: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  sections: CourseSectionApiItem[];
  learningObjectives: string[];
  targetAudience: string[];
  techTags: string[];
  level: string;
  instructorStudentCount: number;
  instructorCourseCount: number;
  instructorRating: number;
  instructorOneLineIntro: string | null; // 강사 한줄소개 (현재 BE 전부 null — 시드 대기)
  instructorIntroduction: string | null; // 강사 자기소개
  instructorCareer: string | null; // 강사 경력 (BE는 단일 string)
  /** 권장 완강 기간(주). ⚠️ BE 상세 응답(CourseDetailResponse)엔 미포함 — 생성/수정 요청에만 존재 → 조회 시 항상 undefined(BE 추가 대기). */
  recommendedWeeks?: number | null;
  /** 하루 학습 상한(분). ⚠️ 위와 동일 — BE 상세 응답 미제공 → 조회 시 항상 undefined. */
  dailyMaxMinutes?: number | null;
}

