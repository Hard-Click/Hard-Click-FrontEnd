import { getUsernameError } from './schemas';

// 아이디(username) 형식 검증 — BE SignupRequest @Pattern("^[a-zA-Z0-9]{4,20}$")과 동일 규칙.
// FE가 형식을 안 막으면 중복확인(형식 미검증)까지 통과 후 마지막 가입에서만 BE 400으로 거부된다.
describe('getUsernameError — 아이디 형식 검증 (BE @Pattern 정합)', () => {
  it('빈 값이면 입력 안내를 준다', () => {
    expect(getUsernameError('')).toBe('아이디를 입력해주세요');
    expect(getUsernameError('   ')).toBe('아이디를 입력해주세요');
  });

  it('영문+숫자 4~20자는 통과(빈 문자열 반환)', () => {
    expect(getUsernameError('hyun1234')).toBe('');
    expect(getUsernameError('abcd')).toBe(''); // 경계: 4자
    expect(getUsernameError('a1234567890123456789')).toBe(''); // 경계: 20자
    expect(getUsernameError('USER99')).toBe('');
    expect(getUsernameError('12345')).toBe(''); // 순수 숫자도 regex상 유효(BE와 동일)
    expect(getUsernameError('abcdef')).toBe(''); // 순수 영문도 유효
    expect(getUsernameError('  abcd  ')).toBe(''); // 트림 후 유효
  });

  const FORMAT_MSG = '아이디는 영문, 숫자 조합으로 4자 이상 20자 이하여야 합니다';

  it('한글 아이디는 형식 에러(가입 실패의 실제 원인)', () => {
    expect(getUsernameError('안현')).toBe(FORMAT_MSG);
    expect(getUsernameError('안현테스트')).toBe(FORMAT_MSG);
  });

  it('4자 미만·20자 초과는 형식 에러', () => {
    expect(getUsernameError('ab1')).toBe(FORMAT_MSG); // 3자
    expect(getUsernameError('a12345678901234567890')).toBe(FORMAT_MSG); // 21자
  });

  it('특수문자·공백 포함은 형식 에러', () => {
    expect(getUsernameError('hyun_123')).toBe(FORMAT_MSG);
    expect(getUsernameError('hyun.123')).toBe(FORMAT_MSG);
    expect(getUsernameError('hyun 123')).toBe(FORMAT_MSG);
    expect(getUsernameError('hyun@123')).toBe(FORMAT_MSG);
  });
});
