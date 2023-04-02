interface Props {
  count: number;
}

export function CountBadge({ count }: Props) {
  if (count === 0) return null;
  return (
    <>
      <div aria-hidden className="opacity-70 text-3xs rounded mb-0.5 ml-1 h-4 font-mono">
        {count}
      </div>
    </>
  );
}
