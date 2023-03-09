import classnames from 'classnames';
import type { ComponentChildren, ComponentType } from 'preact';
import { Children, Fragment } from 'react';

const spaceClassesX = {
  0: 'pr-0',
  1: 'pr-1',
  2: 'pr-2',
  3: 'pr-3',
  4: 'pr-4',
  5: 'pr-5',
  6: 'pr-6',
};

const spaceClassesY = {
  0: 'pt-0',
  1: 'pt-1',
  2: 'pt-2',
  3: 'pt-3',
  4: 'pt-4',
  5: 'pt-5',
  6: 'pt-6',
};

interface HStackProps extends BaseStackProps {
  space?: keyof typeof spaceClassesX;
  children?: ComponentChildren;
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
  children: ComponentChildren;
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

interface BaseStackProps {
  as?: ComponentType | 'ul';
  alignItems?: 'start' | 'center';
  justifyContent?: 'start' | 'center' | 'end';
  className?: string;
  children?: ComponentChildren;
}

function BaseStack({ className, alignItems, justifyContent, children, as }: BaseStackProps) {
  const Component = as ?? 'div';
  return (
    <Component
      className={classnames(
        className,
        'flex flex-grow-0',
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
