import * as S from '@radix-ui/react-scroll-area';
import classnames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  type?: S.ScrollAreaProps['type'];
}

export function ScrollArea({ children, className, type }: Props) {
  return (
    <S.Root
      className={classnames(className, 'group/scroll overflow-hidden')}
      type={type ?? 'hover'}
    >
      <S.Viewport className="h-full w-full">{children}</S.Viewport>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
      <S.Corner />
    </S.Root>
  );
}

function ScrollBar({ orientation }: { orientation: 'vertical' | 'horizontal' }) {
  return (
    <S.Scrollbar
      orientation={orientation}
      className={classnames(
        'scrollbar-track flex rounded-full',
        orientation === 'vertical' && 'w-1.5',
        orientation === 'horizontal' && 'h-1.5 flex-col',
      )}
    >
      <S.Thumb className="scrollbar-thumb flex-1 rounded-full" />
    </S.Scrollbar>
  );
}
