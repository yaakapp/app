interface Props {
  count: number;
}

export function CountBadge({ count }: Props) {
  if (count === 0) return null;
  return (
    <div aria-hidden className="opacity-80 text-2xs border rounded px-1 mb-0.5 ml-1 h-4">
      {count}
    </div>
  );
}
