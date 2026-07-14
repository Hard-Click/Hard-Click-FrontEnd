import { normalizeProfileImageUrl } from './utils';

describe('normalizeProfileImageUrl', () => {
  it('BE 기본 상대경로("/images/default-profile.png")는 null로 정규화한다 (폴백 아이콘 유도)', () => {
    expect(normalizeProfileImageUrl('/images/default-profile.png')).toBeNull();
  });

  it('절대 http(s) URL(presigned S3 등)은 그대로 통과시킨다', () => {
    const s3 =
      'https://flown-bucket.s3.ap-northeast-2.amazonaws.com/profile/1.png';
    expect(normalizeProfileImageUrl(s3)).toBe(s3);
    expect(normalizeProfileImageUrl('http://example.com/a.png')).toBe(
      'http://example.com/a.png',
    );
  });

  it('null·undefined·빈 문자열·공백·기타 상대경로는 null', () => {
    expect(normalizeProfileImageUrl(null)).toBeNull();
    expect(normalizeProfileImageUrl(undefined)).toBeNull();
    expect(normalizeProfileImageUrl('')).toBeNull();
    expect(normalizeProfileImageUrl('   ')).toBeNull();
    expect(normalizeProfileImageUrl('/uploads/x.png')).toBeNull();
  });

  it('호스트 없는 반쪽 값·비-http 프로토콜·비URL은 null (접두사 통과 방지)', () => {
    expect(normalizeProfileImageUrl('https://')).toBeNull(); // 호스트 없음 → URL 파싱 throw
    expect(normalizeProfileImageUrl('http://')).toBeNull();
    expect(normalizeProfileImageUrl('ftp://example.com/a.png')).toBeNull(); // http(s) 아님
    expect(normalizeProfileImageUrl('data:image/png;base64,AAAA')).toBeNull();
    expect(normalizeProfileImageUrl('not-a-url')).toBeNull();
  });

  it('앞뒤 공백은 trim 후 유효 URL이면 통과', () => {
    expect(normalizeProfileImageUrl('  https://cdn.example.com/a.png  ')).toBe(
      'https://cdn.example.com/a.png',
    );
  });
});
