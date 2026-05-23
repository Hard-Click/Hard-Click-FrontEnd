import Link from 'next/link';
import type { CourseListItem } from '../types';

const SUBJECT_GRADIENTS: Record<string, [string, string]> = {
  '국어':       ['#059669', '#34D399'],
  '수학Ⅰ':     ['#2563EB', '#60A5FA'],
  '수학Ⅱ':     ['#3730A3', '#818CF8'],
  '영어':       ['#7C3AED', '#C084FC'],
  '한국사':     ['#D97706', '#FCD34D'],
  '물리학Ⅰ':   ['#374151', '#9CA3AF'],
  '화학Ⅰ':     ['#0891B2', '#67E8F9'],
  '생명과학Ⅰ': ['#16A34A', '#86EFAC'],
  '지구과학Ⅰ': ['#0369A1', '#7DD3FC'],
  '사회문화':   ['#B45309', '#FDE68A'],
  '생활과 윤리':['#BE185D', '#F9A8D4'],
  '한국지리':   ['#4D7C0F', '#BEF264'],
  '세계지리':   ['#0E7490', '#A5F3FC'],
  '정치와 법':  ['#6D28D9', '#DDD6FE'],
  '경제':       ['#92400E', '#FDE68A'],
};

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFB800">
      <path d="M8 1.33l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.1 4.48 12.17l.67-3.92L2.3 5.47l3.94-.57L8 1.33z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 13.5c0-2.2 1.8-3.5 5-3.5s5 1.3 5 3.5" stroke="#4B5563" strokeWidth="1.33" strokeLinecap="round" />
      <circle cx="7" cy="5.5" r="2.5" stroke="#4B5563" strokeWidth="1.33" />
      <path d="M12 10c1.5.4 2.5 1.3 2.5 3" stroke="#4B5563" strokeWidth="1.33" strokeLinecap="round" />
      <path d="M10.5 3.2c1.2.4 2 1.5 2 2.8" stroke="#4B5563" strokeWidth="1.33" strokeLinecap="round" />
    </svg>
  );
}


interface Props {
  course: CourseListItem;
}

export default function CourseCard({ course }: Props) {
  const [fromColor, toColor] = SUBJECT_GRADIENTS[course.subjectName] ?? ['#475569', '#94A3B8'];

  return (
    <Link
      href={`/courses/${course.courseId}`}
      className="group block bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-xl transition-shadow duration-200"
    >
      {/* Thumbnail */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '284/192' }}>
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${fromColor}, ${toColor})` }}
          />
        )}

        {/* 무료 배지 */}
        {course.isFree && (
          <span className="absolute top-3 left-3 z-10 bg-[#16A34A] text-white text-sm font-semibold px-3 py-1 rounded-full">
            무료
          </span>
        )}

      </div>

      {/* 카드 내용 */}
      <div className="p-5">
        {/* 과목 배지 */}
        <span className="inline-block bg-[rgba(47,93,170,0.1)] text-[#2F5DAA] text-xs font-semibold px-2 py-1 rounded mb-3">
          {course.subjectName}
        </span>

        {/* 강의명 */}
        <h3 className="text-[#1F2937] font-semibold text-lg leading-snug mb-2 line-clamp-2 min-h-[50px]">
          {course.title}
        </h3>

        {/* 강사명 */}
        <p className="text-[#4B5563] text-sm mb-3">{course.instructorName}</p>

        {/* 별점 */}
        <div className="flex items-center gap-1 mb-2">
          <StarIcon />
          <span className="text-[#1F2937] font-semibold text-sm">{course.averageRating.toFixed(1)}</span>
          <span className="text-[#4B5563] text-sm">({course.reviewCount.toLocaleString()})</span>
        </div>

        {/* 수강생 수 */}
        <div className="flex items-center gap-2 mb-4">
          <PeopleIcon />
          <span className="text-[#4B5563] text-sm">{course.studentCount.toLocaleString()}명 수강</span>
        </div>

        {/* 가격 */}
        {course.isFree ? (
          <p className="text-[#16A34A] font-bold text-xl">무료</p>
        ) : (
          <p className="text-[#2F5DAA] font-bold text-xl">{course.price.toLocaleString()}원</p>
        )}
      </div>
    </Link>
  );
}
