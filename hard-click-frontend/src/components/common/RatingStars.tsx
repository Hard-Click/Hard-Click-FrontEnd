/** 정수 별점 표시(1~5). rating을 내림(Math.floor)하여 채워진 별 개수를 정한다. */

/* eslint-disable @next/next/no-img-element */
export function StarIcon({
  filled,
  size = 20,
}: {
  filled: boolean;
  size?: number;
}) {
  return filled ? (
    <img src="/icons/starFilledIcon.svg" width={size} height={size} alt="" />
  ) : (
    <img src="/icons/starEmptyIcon.svg" width={size} height={size} alt="" />
  );
}

export function StarRow({
  rating,
  size = 20,
}: {
  rating: number;
  size?: number;
}) {
  const rounded = Math.floor(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= rounded} size={size} />
      ))}
    </div>
  );
}
