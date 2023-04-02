interface Props {
  count: number;
}

export function CountBadge({ count }: Props) {
  if (count === 0) return null;
  return (
    <>
      <div
        aria-hidden
        className="opacity-70 border border-highlight text-3xs rounded mb-0.5 px-1 ml-1 h-4 font-mono"
      >
        {count}
      </div>
    </>
  );
}
