/**
 * 프로필 이미지 URL 정규화.
 *
 * ⚠️ BE(GET /api/members/me)는 프로필 이미지가 없는 유저에게 `profileImageUrl`로 **상대경로**
 *    `"/images/default-profile.png"`를 준다(ProfileQueryService.DEFAULT_PROFILE_IMAGE_URL,
 *    presign 실패 시에도 동일). 이 상대경로는 브라우저가 **FE 오리진** 기준으로 해석하는데
 *    FE `public/`엔 그 파일이 없어 404 → 아바타가 깨진 빈 원으로 뜬다. 게다가 값이 truthy라
 *    헤더/마이페이지의 기본 아바타 아이콘 폴백(`headerperson.svg`·`profileAvatarIcon.svg`)
 *    분기도 타지 못한다.
 *
 * → 별도 오리진에서 실제로 불러올 수 있는 **절대 http(s) URL**(presigned S3 등)만 이미지로 인정하고,
 *   그 외(상대경로 기본 이미지·빈 문자열)는 `null`로 정규화해 FE가 설계된 폴백 아이콘을 그리게 한다.
 */
export function normalizeProfileImageUrl(
  url: string | null | undefined,
): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}
