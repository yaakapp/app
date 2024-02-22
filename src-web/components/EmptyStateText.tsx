import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function EmptyStateText({ children }: Props) {
  return (
    <div className="rounded-lg border border-dashed border-highlight h-full py-2 text-gray-400 flex items-center justify-center">
      {children}
    </div>
  );
}
