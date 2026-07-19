import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { subjectCategory, type SubjectCategory } from '@/features/courses/subjects';
import { mockAiCoachComment, mockScheduleBlocks, mockTodayTasks } from '@/mocks/schedule.mock';
import type { ScheduleBlock, TodayTask, TodayTasksSummary } from './types';

function toISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/* ─────────────────────────────────────────────────────────────────────────
 * BE 학습 스케줄 조회 응답(가정 shape) — `GET /api/schedule/me`, `/me/today`.
 * PR#3(slotId/lessonTitle) 과 PR#5(itemId/source/title/endTime, LESSON+TODO union) 를 모두 견디게
 * 옵셔널로 받는다. 실제 배포된 형태에 따라 채워지는 필드가 다를 수 있음 → 방어적으로 매핑.
 * ───────────────────────────────────────────────────────────────────────── */
interface ApiScheduleItem {
  slotId?: number;
  itemId?: number;
  source?: 'LESSON' | 'TODO' | 'REVIEW';
  planDate: string;
  startTime?: string | null;
  endTime?: string | null;
  subject?: string | null;
  title?: string | null;
  lessonTitle?: string | null;
  courseTitle?: string | null;
  /** 오답 기반 복습(REVIEW) 항목의 강의 id — 유사퀴즈(/quizzes/similar?courseId=) 진입용. LESSON=강의 id, TODO=null. */
  courseId?: number | null;
  plannedMinutes?: number;
  status?: string;
}
interface ApiTodayView {
  items: ApiScheduleItem[];
  doneCount: number;
  totalCount: number;
}

// BE subject 가 enum("KO_READING")이 아니라 한글 라벨("영어"·"복습")로 올 수도 있어 둘 다 흡수.
const LABEL_TO_CATEGORY: Record<string, SubjectCategory> = {
  국어: 'KOREAN', 수학: 'MATH', 영어: 'ENGLISH', 한국사: 'KOREAN_HISTORY',
  사회: 'SOCIAL', 과학: 'SCIENCE', 외국어: 'FOREIGN_LANGUAGE', 복습: 'REVIEW',
};
function toCategory(subject?: string | null): SubjectCategory {
  if (!subject) return 'OTHER';
  return subjectCategory(subject) ?? LABEL_TO_CATEGORY[subject] ?? 'OTHER';
}

/** source 미제공(구 PR#3 응답)이면 slotId만 있는 LESSON으로 간주. REVIEW는 BE가 명시적으로 내려준다. */
function toSource(it: ApiScheduleItem): 'LESSON' | 'TODO' | 'REVIEW' {
  return it.source ?? (it.slotId != null ? 'LESSON' : 'TODO');
}

/** BE 원본 id. 구 응답(slotId만 있는 경우) 대비 폴백 포함. */
function toItemId(it: ApiScheduleItem): number {
  return it.itemId ?? it.slotId ?? 0;
}

/**
 * 화면 리스트 key — itemId/slotId는 각 source 안에서만 유일해, 소스가 다르면 id 값이 겹칠 수 있어
 * source로 네임스페이스한다. id가 없으면 planDate+제목 폴백.
 * (클라 렌더 키/로컬 토글 전용 — BE로 돌아가지 않아 접두어를 붙여도 안전.)
 */
function itemKey(it: ApiScheduleItem): string {
  const id = it.itemId ?? it.slotId;
  const base = id != null ? String(id) : `${it.planDate}-${it.title ?? it.lessonTitle ?? ''}`;
  return `${toSource(it)}-${base}`;
}

/**
 * 오늘 할 일 조회 (Server Component 전용).
 * live(`isMock('schedule')===false`): `GET /api/schedule/me/today` → 완료수/전체수 포함 오늘 항목.
 * mock: 고정 데이터.
 */
export async function getTodayTasksServer(today: Date = new Date()): Promise<TodayTasksSummary> {
  if (isMock('schedule')) {
    return { date: toISODate(today), tasks: [...mockTodayTasks] };
  }
  const res = await serverApi.get<ApiTodayView>('/api/schedule/me/today');
  if (!res.success) {
    throw new Error(`오늘 할 일 조회 실패 (${res.httpStatus}): ${res.message}`);
  }
  const tasks: TodayTask[] = (res.data?.items ?? []).map((it) => ({
    id: itemKey(it),
    itemId: toItemId(it),
    source: toSource(it),
    title: it.title ?? it.lessonTitle ?? it.courseTitle ?? '학습',
    done: it.status === 'DONE',
    category: toCategory(it.subject),
    // REVIEW 항목이면 오답 기반 강의 id → TodayTaskChecklist가 ReviewStartModal(courseId)로 넘겨 유사퀴즈 진입.
    courseId: it.courseId ?? undefined,
    startTime: it.startTime ?? '',
    endTime: it.endTime ?? '',
  }));
  return { date: toISODate(today), tasks };
}

/**
 * 캘린더에 그릴 학습 구간 조회 (Server Component 전용).
 * live: `GET /api/schedule/me?from=&to=` → 활성 스케줄 슬롯을 날짜별 단일-일 블록으로 변환.
 * mock: 고정 데이터.
 * @param month 조회할 달의 아무 날짜(기본 오늘) — 그 달의 1일~말일을 from/to로 보낸다.
 */
export async function getScheduleBlocksServer(month: Date = new Date()): Promise<ScheduleBlock[]> {
  if (isMock('schedule')) {
    return [...mockScheduleBlocks];
  }
  const from = new Date(month.getFullYear(), month.getMonth(), 1);
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const res = await serverApi.get<ApiScheduleItem[]>(
    `/api/schedule/me?from=${toISODate(from)}&to=${toISODate(to)}`,
  );
  if (!res.success) {
    throw new Error(`학습 스케줄 조회 실패 (${res.httpStatus}): ${res.message}`);
  }
  return (res.data ?? []).map((it) => ({
    id: itemKey(it),
    category: toCategory(it.subject),
    startDate: it.planDate,
    endDate: it.planDate, // BE 슬롯은 하루 단위 → 단일-일 블록
  }));
}

/**
 * AI 학습 코치 코멘트.
 * ⚠️ BE 진도 분석 로직 없음(2026-07-13 기준) — 항상 mock 고정 문구(연동 대상 아님).
 */
export async function getAiCoachCommentServer(): Promise<string> {
  return mockAiCoachComment;
}
