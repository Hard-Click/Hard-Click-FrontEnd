/**
 * toast 래퍼 테스트 — 전역 중복 제거(id=message) 동작 검증.
 * sonner를 mock해, 래퍼가 sonner에 올바른 인자(id 주입/명시 id 존중)를 넘기는지 확인한다.
 */
jest.mock('sonner', () => {
  const base = jest.fn();
  return {
    toast: Object.assign(base, {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
      message: jest.fn(),
      dismiss: jest.fn(),
      promise: jest.fn(),
    }),
  };
});

import { toast as sonner } from 'sonner';
import { toast } from './toast';

const mocked = jest.mocked(sonner);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('toast 래퍼 — 전역 중복 제거(id=message)', () => {
  it('success/error는 같은 문구에 id=message를 주입한다(겹침 방지)', () => {
    toast.success('저장되었습니다');
    expect(mocked.success).toHaveBeenCalledWith('저장되었습니다', {
      id: '저장되었습니다',
    });

    toast.error('저장에 실패했습니다');
    expect(mocked.error).toHaveBeenCalledWith('저장에 실패했습니다', {
      id: '저장에 실패했습니다',
    });
  });

  it('옵션은 그대로 유지하면서 id를 추가한다', () => {
    toast.success('x', { duration: 1000 });
    expect(mocked.success).toHaveBeenCalledWith('x', {
      id: 'x',
      duration: 1000,
    });
  });

  it('명시적으로 넘긴 id는 존중한다(dedup 키를 덮어씀)', () => {
    toast.error('x', { id: 'custom-id' });
    expect(mocked.error).toHaveBeenCalledWith('x', { id: 'custom-id' });
  });

  it('bare toast() 호출도 id=message를 주입한다(콜러블 유지)', () => {
    toast('안내 메시지');
    expect(mocked).toHaveBeenCalledWith('안내 메시지', { id: '안내 메시지' });
  });

  it('warning/info/message도 id를 주입한다', () => {
    toast.warning('경고');
    expect(mocked.warning).toHaveBeenCalledWith('경고', { id: '경고' });
    toast.info('정보');
    expect(mocked.info).toHaveBeenCalledWith('정보', { id: '정보' });
    toast.message('메시지');
    expect(mocked.message).toHaveBeenCalledWith('메시지', { id: '메시지' });
  });

  it('promise·dismiss 등 원본 메서드를 그대로 보존한다', () => {
    expect(typeof toast.promise).toBe('function');
    expect(typeof toast.dismiss).toBe('function');
  });
});
