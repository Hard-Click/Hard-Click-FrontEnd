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

  it('null·undefined·빈 문자열·기타 상대경로는 null', () => {
    expect(normalizeProfileImageUrl(null)).toBeNull();
    expect(normalizeProfileImageUrl(undefined)).toBeNull();
    expect(normalizeProfileImageUrl('')).toBeNull();
    expect(normalizeProfileImageUrl('/uploads/x.png')).toBeNull();
  });
});
