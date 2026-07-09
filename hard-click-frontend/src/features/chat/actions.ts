'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { getChatHistoryServer } from './server';
import type { ChatHistoryPage } from './types';

/**
 * 채팅방 이탈 액션 — 나가기 / 강퇴 / 방 삭제(해산). 전부 study 도메인(`/api/studies/...`) 호출.
 *   - 나가기: DELETE /api/studies/{groupId}/leave (방장은 참여자 남으면 403)
 *   - 강퇴: DELETE /api/studies/{groupId}/members/{memberId} (방장만·재입장 차단, 이슈 #460)
 *   - 삭제: DELETE /api/studies/{groupId} (방장만·전원 강퇴 후, 이슈 #441)
 * 성공 시 revalidatePath로 커뮤니티·마이페이지 목록 캐시 무효화(§5). 실시간 갱신은 소켓 이벤트.
 * ⚠️ BE 미배포라 isMock('chat')이면 mock 성공 분기, 아니면 실 seam. study URL은 곽시윤 도메인 → 공유.
 */

export interface ChatActionResult {
  success: boolean;
  message: string;
}

/** 참여자 강퇴 (방장만). */
export async function kickMemberAction(
  groupId: number,
  memberId: number,
): Promise<ChatActionResult> {
  if (
    !Number.isInteger(groupId) ||
    groupId <= 0 ||
    !Number.isInteger(memberId) ||
    memberId <= 0
  ) {
    return { success: false, message: '잘못된 요청입니다.' };
  }

  if (isMock('chat')) return { success: true, message: '내보냈습니다.' };

  // ── BE 연동 seam (엔드포인트 신설 필요) ──
  const res = await serverApi.delete(
    `/api/studies/${groupId}/members/${memberId}`,
  );
  if (!res.success) {
    return { success: false, message: res.message || '내보내기에 실패했어요.' };
  }
  revalidatePath('/community'); // 스터디 목록 인원수 갱신
  return { success: true, message: '내보냈습니다.' };
}

/** 방 폭파(해산) (방장만). */
export async function dissolveRoomAction(
  groupId: number,
): Promise<ChatActionResult> {
  if (!Number.isInteger(groupId) || groupId <= 0) {
    return { success: false, message: '잘못된 요청입니다.' };
  }

  if (isMock('chat')) return { success: true, message: '채팅방을 삭제했어요.' };

  // ── BE 연동 seam ──
  // 규칙 ①(팀 확정): 참여자 남아있으면 삭제 불가 → 먼저 강퇴. 방장 혼자일 때만 호출됨(가드는 클라).
  const res = await serverApi.delete(`/api/studies/${groupId}`);
  if (!res.success) {
    return { success: false, message: res.message || '삭제에 실패했어요.' };
  }
  revalidatePath('/community');
  revalidatePath('/mypage');
  revalidatePath('/mypage/chats');
  return { success: true, message: '채팅방을 삭제했어요.' };
}

/** 채팅방 나가기 (참여자 퇴장). */
export async function leaveStudyChatAction(
  groupId: number,
): Promise<ChatActionResult> {
  if (!Number.isInteger(groupId) || groupId <= 0) {
    return { success: false, message: '잘못된 요청입니다.' };
  }

  if (isMock('chat')) return { success: true, message: '채팅방에서 나갔습니다.' };

  // ── BE 연동 seam ── DELETE /api/studies/{groupId}/leave (방장은 참여자 남으면 403 → res.message 안내)
  const res = await serverApi.delete(`/api/studies/${groupId}/leave`);
  if (!res.success) {
    return { success: false, message: res.message || '나가기에 실패했어요.' };
  }
  revalidatePath('/community');
  revalidatePath('/mypage');
  revalidatePath('/mypage/chats');
  return { success: true, message: '채팅방에서 나갔습니다.' };
}

/** 옛 메시지 더 로드 (무한스크롤). 클라가 부를 수 있게 getChatHistoryServer를 Server Action으로 래핑. */
export async function loadOlderMessagesAction(
  chatRoomId: number,
  cursorId: number,
): Promise<ChatHistoryPage> {
  // Server Action 경계 — 클라가 임의 인자로 호출 가능하므로 검증(§5, 다른 액션과 일관). 오염 인자면 빈 페이지.
  if (
    !Number.isInteger(chatRoomId) ||
    chatRoomId <= 0 ||
    !Number.isInteger(cursorId) ||
    cursorId <= 0
  ) {
    return { messages: [], hasNext: false, nextCursorId: null };
  }
  return getChatHistoryServer(chatRoomId, cursorId);
}
