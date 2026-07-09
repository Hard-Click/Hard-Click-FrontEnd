/** 방장 표시용 왕관 아이콘 (앰버). public/icons에 왕관 에셋이 없어 인라인 SVG. */
export default function CrownIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#D97706"
    >
      <path d="M3 8l4.6 3L12 5l4.4 6L21 8l-1.5 9.2a1 1 0 0 1-1 .8H5.5a1 1 0 0 1-1-.8L3 8z" />
    </svg>
  );
}
