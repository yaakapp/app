import type { HTMLAttributes, ReactNode } from 'react';
import React, { Children, Fragment } from 'react';
import classnames from 'classnames';

const spaceClassesX = {
  0: 'pr-0',
  1: 'pr-1',
  2: 'pr-2',
  3: 'pr-3',
  4: 'pr-4',
};

const spaceClassesY = {
  0: 'pt-0',
  1: 'pt-1',
  2: 'pt-2',
  3: 'pt-3',
  4: 'pt-4',
};

interface HStackProps extends BaseStackProps {
  space?: keyof typeof spaceClassesX;
  children?: ReactNode;
}

export function HStack({ className, space, children, ...props }: HStackProps) {
  return (
    <BaseStack className={classnames(className, 'flex-row')} {...props}>
      {space
        ? Children.toArray(children)
            .filter(Boolean) // Remove null/false/undefined children
            .map((c, i) => (
              <Fragment key={i}>
                {i > 0 ? (
                  <div
                    className={classnames(spaceClassesX[space], 'pointer-events-none')}
                    data-spacer=""
                    aria-hidden
                  />
                ) : null}
                {c}
              </Fragment>
            ))
        : children}
    </BaseStack>
  );
}

export interface VStackProps extends BaseStackProps {
  space?: keyof typeof spaceClassesY;
  children: ReactNode;
}

export function VStack({ className, space, children, ...props }: VStackProps) {
  return (
    <BaseStack className={classnames(className, 'w-full h-full flex-col')} {...props}>
      {space
        ? Children.toArray(children)
            .filter(Boolean) // Remove null/false/undefined children
            .map((c, i) => (
              <Fragment key={i}>
                {i > 0 ? (
                  <div
                    className={classnames(spaceClassesY[space], 'pointer-events-none')}
                    data-spacer=""
                    aria-hidden
                  />
                ) : null}
                {c}
              </Fragment>
            ))
        : children}
    </BaseStack>
  );
}

interface BaseStackProps extends HTMLAttributes<HTMLElement> {
  items?: 'start' | 'center';
  justify?: 'start' | 'end';
  as?: React.ElementType;
}

function BaseStack({ className, items, justify, as = 'div', ...props }: BaseStackProps) {
  const Component = as;
  return (
    <Component
      className={classnames(
        className,
        'flex flex-grow-0',
        items === 'center' && 'items-center',
        items === 'start' && 'items-start',
        justify === 'start' && 'justify-start',
        justify === 'end' && 'justify-end',
      )}
      {...props}
    />
  );
}
