'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { mockChatRoomDetail } from '@/mocks/chat.mock';

/**
 * 스터디 게시판 "입장하기 / 참여하기" → 채팅방 진입 배선.
 * chatRoomId는 스터디 목록엔 없고 **상세/참여 응답**에만 있으므로, 여기서 얻어 반환한다.
 * ⚠️ 채팅 미배포 → isMock('chat') 동안은 mock 채팅방(chatRoomId)으로 진입. BE 배포 후 실 study API 호출.
 *    study 도메인 URL(/api/study)이라 곽시윤 커뮤니티와 공유되는 지점.
 */

export interface StudyEntryResult {
  success: boolean;
  chatRoomId?: number;
  message: string;
}

/** 이미 참여 중인 스터디 → 채팅방 입장 (상세 조회로 chatRoomId 획득). */
export async function enterStudyChatAction(
  groupId: number,
): Promise<StudyEntryResult> {
  if (!Number.isInteger(groupId) || groupId <= 0) {
    return { success: false, message: '잘못된 요청입니다.' };
  }

  if (isMock('chat')) {
    return {
      success: true,
      chatRoomId: mockChatRoomDetail.chatRoomId,
      message: '',
    };
  }

  // ── BE 연동 seam ── GET /api/study/{groupId} → data.chatRoomId
  const res = await serverApi.get<{ chatRoomId: number }>(
    `/api/study/${groupId}`,
  );
  if (!res.success || !res.data) {
    return { success: false, message: res.message || '채팅방을 열지 못했어요.' };
  }
  return { success: true, chatRoomId: res.data.chatRoomId, message: '' };
}

/** 미참여 스터디 → 참여(join) 후 채팅방 입장 (참여 응답의 chatRoomId). */
export async function joinStudyChatAction(
  groupId: number,
): Promise<StudyEntryResult> {
  if (!Number.isInteger(groupId) || groupId <= 0) {
    return { success: false, message: '잘못된 요청입니다.' };
  }

  if (isMock('chat')) {
    return {
      success: true,
      chatRoomId: mockChatRoomDetail.chatRoomId,
      message: '스터디에 참여했어요.',
    };
  }

  // ── BE 연동 ── POST /api/study/{groupId}/join → data.chatRoomId
  const res = await serverApi.post<{
    groupId: number;
    chatRoomId: number;
    currentCount: number;
  }>(`/api/study/${groupId}/join`);
  if (!res.success || !res.data) {
    // ⚠️ '이미 참여 중'(SG005/400)은 실패가 아니라 **입장**이 정답이다.
    //   원인: BE 스터디 **목록**(StudyListResponse.StudyItem)이 isMine/isJoined를 주지 않아
    //   FE가 참여 여부를 알 수 없고, 내가 만든/이미 참여한 스터디도 전부 '참여하기'로 렌더된다.
    //   → 누르면 SG005가 떠서 채팅방에 못 들어가던 버그(BE 코드 검증 2026-07-17:
    //      StudyDetailResponse엔 isMine/isJoined/chatRoomId가 있지만 목록엔 없음).
    //   상세에 chatRoomId가 있으므로 여기서 입장으로 전환해 흐름을 살린다.
    //   근본 해결 = BE가 **목록에도 isMine/isJoined 제공** → 그때 라벨도 '입장하기'로 정확해짐(FE 소량).
    if (res.errorCode === 'SG005') {
      return enterStudyChatAction(groupId);
    }
    // 그 외(정원 초과·없는 스터디 등)는 진짜 실패 → BE 메시지 그대로 안내.
    return { success: false, message: res.message || '참여에 실패했어요.' };
  }
  revalidatePath('/community'); // 참여 → 스터디 목록 인원수 갱신
  return {
    success: true,
    chatRoomId: res.data.chatRoomId,
    message: '스터디에 참여했어요.',
  };
}
