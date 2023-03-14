import * as S from '@radix-ui/react-scroll-area';
import classnames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function ScrollArea({ children, className }: Props) {
  return (
    <S.Root className={classnames(className, 'group/scroll')} type="always">
      <S.Viewport>{children}</S.Viewport>
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
        'flex bg-transparent rounded-full',
        orientation === 'vertical' && 'w-1.5',
        orientation === 'horizontal' && 'h-1.5 flex-col',
      )}
    >
      <S.Thumb className="flex-1 bg-gray-100 group-hover/scroll:bg-gray-200 rounded-full" />
    </S.Scrollbar>
  );
}
