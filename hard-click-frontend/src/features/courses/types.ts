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

/* ───── 백엔드 응답 (실제 Hard-Click-BackEnd 코드 DTO 기준) ───── */

export type PriceType = 'FREE' | 'PAID';
export type ApiCourseStatus = 'DRAFT' | 'PUBLISHED';

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
}

