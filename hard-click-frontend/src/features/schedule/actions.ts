'use server';

import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';

interface ScheduleActionResult {
  success: boolean;
  message: string;
}

interface TodoActionResult extends ScheduleActionResult {
  /** 생성 성공 시 BE가 내려준 새 todo id. */
  todoId?: number;
}

/** POST/PUT /todos 공통 바디. planDate는 필수, 시작·끝은 둘 다 넣거나 둘 다 빼야 한다(SC003/SC004는 BE가 최종 검증). */
export interface TodoPayload {
  title: string;
  subject?: string;
  planDate: string;
  startTime?: string;
  endTime?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  SC001: '본인 학습 슬롯이 아니에요.',
  SC002: '본인 할 일이 아니거나 이미 삭제됐어요.',
  SC003: '시작·종료 시간은 둘 다 입력하거나 둘 다 비워야 해요.',
  SC004: '종료 시간은 시작 시간보다 늦어야 해요.',
};

function toActionResult(res: { success: boolean; errorCode?: string; message?: string }, fallback: string): ScheduleActionResult {
  if (res.success) return { success: true, message: fallback };
  return { success: false, message: (res.errorCode && ERROR_MESSAGES[res.errorCode]) || res.message || fallback };
}

/** LESSON(AI 슬롯) 완료 처리. mock 단계는 실호출 없이 성공만 흉내낸다. */
export async function completeLessonAction(itemId: number): Promise<ScheduleActionResult> {
  if (isMock('schedule')) return { success: true, message: '완료로 표시했어요.' };
  const res = await serverApi.patch(`/api/schedule/slots/${itemId}/complete`);
  return toActionResult(res, '완료로 표시했어요.');
}

/** TODO(학생 추가) 완료 처리. mock 단계는 실호출 없이 성공만 흉내낸다. */
export async function completeTodoAction(itemId: number): Promise<ScheduleActionResult> {
  if (isMock('schedule')) return { success: true, message: '완료로 표시했어요.' };
  const res = await serverApi.patch(`/api/schedule/todos/${itemId}/complete`);
  return toActionResult(res, '완료로 표시했어요.');
}

/** 할 일 추가. mock 단계는 실호출 없이 임의 id로 성공만 흉내낸다. */
export async function createTodoAction(payload: TodoPayload): Promise<TodoActionResult> {
  if (isMock('schedule')) {
    return { success: true, message: '할 일을 추가했어요.', todoId: Date.now() };
  }
  const res = await serverApi.post<number>('/api/schedule/todos', payload);
  if (!res.success) return toActionResult(res, '할 일 추가에 실패했어요.');
  return { success: true, message: '할 일을 추가했어요.', todoId: res.data };
}

/** 할 일 수정. mock 단계는 실호출 없이 성공만 흉내낸다. */
export async function updateTodoAction(itemId: number, payload: TodoPayload): Promise<ScheduleActionResult> {
  if (isMock('schedule')) return { success: true, message: '할 일을 수정했어요.' };
  const res = await serverApi.put(`/api/schedule/todos/${itemId}`, payload);
  return toActionResult(res, '할 일을 수정했어요.');
}

/** 할 일 삭제. mock 단계는 실호출 없이 성공만 흉내낸다. */
export async function deleteTodoAction(itemId: number): Promise<ScheduleActionResult> {
  if (isMock('schedule')) return { success: true, message: '할 일을 삭제했어요.' };
  const res = await serverApi.delete(`/api/schedule/todos/${itemId}`);
  return toActionResult(res, '할 일을 삭제했어요.');
}
