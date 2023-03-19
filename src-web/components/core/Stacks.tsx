import classnames from 'classnames';
import type { ComponentType, ReactNode } from 'react';

const gapClasses = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
};

interface HStackProps extends BaseStackProps {
  children?: ReactNode;
}

export function HStack({ className, space, children, ...props }: HStackProps) {
  return (
    <BaseStack className={classnames(className, 'flex-row', space && gapClasses[space])} {...props}>
      {children}
    </BaseStack>
  );
}

export interface VStackProps extends BaseStackProps {
  children: ReactNode;
}

export function VStack({ className, space, children, ...props }: VStackProps) {
  return (
    <BaseStack
      className={classnames(className, 'w-full h-full flex-col', space && gapClasses[space])}
      {...props}
    >
      {children}
    </BaseStack>
  );
}

interface BaseStackProps {
  as?: ComponentType | 'ul';
  space?: keyof typeof gapClasses;
  alignItems?: 'start' | 'center';
  justifyContent?: 'start' | 'center' | 'end';
  className?: string;
  children?: ReactNode;
}

function BaseStack({ className, alignItems, justifyContent, children, as }: BaseStackProps) {
  const Component = as ?? 'div';
  return (
    <Component
      className={classnames(
        className,
        'flex',
        alignItems === 'center' && 'items-center',
        alignItems === 'start' && 'items-start',
        justifyContent === 'start' && 'justify-start',
        justifyContent === 'center' && 'justify-center',
        justifyContent === 'end' && 'justify-end',
      )}
    >
      {children}
    </Component>
  );
}
