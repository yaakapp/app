import React, { Children, Fragment, HTMLAttributes, ReactNode } from 'react';
import classnames from 'classnames';

const spaceClasses = {
  '0': 'pt-0',
  '1': 'pt-1',
};

type Space = keyof typeof spaceClasses;

interface HStackProps extends BoxProps {
  space?: Space;
  children: ReactNode;
}

export function Stacks({ className, space, children, ...props }: HStackProps) {
  return (
    <BaseStack className={classnames(className, 'flex-row')} {...props}>
      {space
        ? Children.toArray(children)
            .filter(Boolean) // Remove null/false/undefined children
            .map((c, i) => (
              <Fragment key={i}>
                {i > 0 ? (
                  <div
                    className={classnames(className, spaceClasses[space], 'pointer-events-none')}
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

export interface VStackProps extends BoxProps {
  space?: Space;
  children: ReactNode;
}

export function VStack({ className, space, children, ...props }: VStackProps) {
  return (
    <BaseStack className={classnames(className, 'flex-col')} {...props}>
      {space
        ? Children.toArray(children)
            .filter(Boolean) // Remove null/false/undefined children
            .map((c, i) => (
              <Fragment key={i}>
                {i > 0 ? (
                  <div
                    className={classnames(spaceClasses[space], 'pointer-events-none')}
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

interface BoxProps extends HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

function BaseStack({ className, as = 'div', ...props }: BoxProps) {
  const Component = as;
  return <Component className={classnames(className, 'flex flex-grow-0')} {...props} />;
}
