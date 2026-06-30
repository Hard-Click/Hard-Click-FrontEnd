/**
 * useWatchTimeSaver 훅 테스트 — §0.1 "가짜 완료 차단"의 핵심 회귀.
 * 완료(onCompleted)는 watch-time 누적 rate>=90 + BE completeVideo()가 성공(200)일 때만 발화해야 한다.
 *  - completeVideo 실패(409/L004/500)면 onCompleted 미발화
 *  - rate<90이면 completeVideo 자체를 부르지 않음(5초만 봐도/적게 봐도 완료 안 됨)
 *  - saveWatchTime 실패면 그 뒤 완료 로직까지 진입하지 않음
 *
 * 시간 의존(Date.now)·heartbeat는 Date.now를 stub하고 isPlaying 전환(재생→정지) flush 경로로 검증.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useWatchTimeSaver } from './useWatchTimeSaver';

jest.mock('@/features/learning/services', () => ({
  saveWatchTime: jest.fn(),
  completeVideo: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn() } }));

import { saveWatchTime, completeVideo } from '@/features/learning/services';

const mockedSave = saveWatchTime as jest.Mock;
const mockedComplete = completeVideo as jest.Mock;

const VIDEO_ID = 1;
const DURATION = 100;
const WATCHED_KEY = `learning:watchedSeconds:${VIDEO_ID}`;

let nowValue = 1_000_000;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  nowValue = 1_000_000;
  jest.spyOn(Date, 'now').mockImplementation(() => nowValue);
});

afterEach(() => {
  jest.restoreAllMocks();
});

const tick = () => new Promise((r) => setTimeout(r, 0));

/** (정지 상태 마운트) → 재생 시작 → 시간 경과 → 정지 로 flush(delta)를 1회 유발한다.
 *  ⚠️ 마운트를 playing:true로 하면 videoId 리셋 effect가 playStartTime을 null로 만들어 flush가 안 됨.
 *     실제 흐름(처음엔 정지)과 동일하게 false→true(재생)→false(정지)로 전환한다. */
function playThenPause(onCompleted: jest.Mock, elapsedSec = 5) {
  const { rerender } = renderHook(
    ({ playing }: { playing: boolean }) =>
      useWatchTimeSaver({
        videoId: VIDEO_ID,
        durationSeconds: DURATION,
        isPlaying: playing,
        onCompleted,
      }),
    { initialProps: { playing: false } },
  );
  rerender({ playing: true }); // 재생 시작 → playStartTime 기록
  nowValue += elapsedSec * 1000; // 재생 중 경과
  rerender({ playing: false }); // 정지 → 잔여 flush
}

describe('useWatchTimeSaver — 완료는 BE completeVideo 성공 시에만(§0.1)', () => {
  it('rate>=90 + completeVideo 성공이면 onCompleted를 호출한다', async () => {
    localStorage.setItem(WATCHED_KEY, '95'); // 이미 95% 시청
    mockedSave.mockResolvedValue({ success: true });
    mockedComplete.mockResolvedValue({ success: true });
    const onCompleted = jest.fn();

    playThenPause(onCompleted, 5); // total 100/100 = 100% → 완료 조건

    await waitFor(() => expect(mockedComplete).toHaveBeenCalledWith(VIDEO_ID));
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it('rate>=90이어도 completeVideo가 실패하면 onCompleted를 호출하지 않는다(가짜완료 차단)', async () => {
    localStorage.setItem(WATCHED_KEY, '95');
    mockedSave.mockResolvedValue({ success: true });
    mockedComplete.mockResolvedValue({ success: false, httpStatus: 409 });
    const onCompleted = jest.fn();

    playThenPause(onCompleted, 5);

    await waitFor(() => expect(mockedComplete).toHaveBeenCalledWith(VIDEO_ID));
    await tick();
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it('rate<90이면 completeVideo 자체를 호출하지 않는다(적게 봐도 완료 안 됨)', async () => {
    localStorage.setItem(WATCHED_KEY, '10'); // 10% + 5초 = 15% < 90
    mockedSave.mockResolvedValue({ success: true });
    const onCompleted = jest.fn();

    playThenPause(onCompleted, 5);

    await waitFor(() => expect(mockedSave).toHaveBeenCalled());
    await tick();
    expect(mockedComplete).not.toHaveBeenCalled();
    expect(onCompleted).not.toHaveBeenCalled();
  });

  it('saveWatchTime가 실패하면 완료 로직까지 가지 않는다', async () => {
    localStorage.setItem(WATCHED_KEY, '95');
    mockedSave.mockResolvedValue({ success: false });
    const onCompleted = jest.fn();

    playThenPause(onCompleted, 5);

    await waitFor(() => expect(mockedSave).toHaveBeenCalled());
    await tick();
    expect(mockedComplete).not.toHaveBeenCalled();
    expect(onCompleted).not.toHaveBeenCalled();
  });
});
