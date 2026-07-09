/**
 * 시스템 메시지 — "○○님이 입장/퇴장했습니다" 등. 가운데 정렬 회색 pill.
 * (Figma에 없던 요소. BE가 시스템 메시지 지원 확정 → 브랜드 톤에 맞춰 신규 디자인.)
 */
export default function SystemMessage({ content }: { content: string }) {
  return (
    <li className="mt-3 flex justify-center">
      <span className="rounded-full bg-[#E5E9F0] px-3.5 py-1 text-xs font-medium text-[#64748B]">
        {content}
      </span>
    </li>
  );
}
