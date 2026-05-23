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

