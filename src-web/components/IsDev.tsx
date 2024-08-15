import type { ReactNode } from 'react';
import { useAppInfo } from '../hooks/useAppInfo';

interface Props {
  children: ReactNode;
}

export function IsDev({ children }: Props) {
  const appInfo = useAppInfo();
  if (!appInfo.isDev) {
    return null;
  }

  return <>{children}</>;
}
