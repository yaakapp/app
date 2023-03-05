import * as S from '@radix-ui/react-scroll-area';
import classnames from 'classnames';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function ScrollArea({ children, className }: Props) {
  return (
    <S.Root className={classnames(className, 'group')} type="always">
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
        orientation === 'vertical' && 'w-1',
        orientation === 'horizontal' && 'h-1 flex-col',
      )}
    >
      <S.Thumb className="flex-1 bg-gray-50 group-hover:bg-gray-100 rounded-full" />
    </S.Scrollbar>
  );
}
