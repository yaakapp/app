import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function EmptyStateText({ children }: Props) {
  return <div className="h-full text-gray-400 flex items-center justify-center">{children}</div>;
}
