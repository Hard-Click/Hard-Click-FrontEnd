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
}

/* ───── 백엔드 응답 명세 (노션 API 목록 기준) ───── */

// GET /api/subjects
export interface SubjectApiItem {
  subjectId: number;
  subjectName: string;
  courseCount?: number;
}

// GET /api/courses (목록) — content[] 항목
export interface CourseListApiItem {
  courseId: number;
  title: string;
  instructorName: string;
  subjectName: string;
  price: number;
  thumbnailUrl?: string; // 강의 목록 조회는 반환, ?subject= 필터 응답엔 미포함
  averageRating: number;
  reviewCount: number;
}

export interface CourseListApiResponse {
  content: CourseListApiItem[];
  totalPages?: number;
}

// GET /api/courses/{courseId} (상세)
export interface CourseDetailApiResponse {
  courseId: number;
  title: string;
  description: string;
  instructorId: number;
  instructorName: string;
  subjectName: string;
  price: number;
  thumbnailUrl: string;
  averageRating: number;
  reviewCount: number;
  curriculum: Array<{
    order: number;
    title: string;
    durationMinutes: number;
  }>;
  createdAt: string;
}

