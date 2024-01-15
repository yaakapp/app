import classNames from 'classnames';
import type { ComponentType, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLHeadingElement> {
  size?: 1 | 2 | 3;
}

export function Heading({ className, size = 1, ...props }: Props) {
  const Component = size === 1 ? 'h1' : size === 2 ? 'h2' : 'h3';
  return (
    <Component
      className={classNames(
        className,
        'font-semibold text-gray-900',
        size === 1 && 'text-2xl',
        size === 2 && 'text-xl',
        size === 3 && 'text-lg',
      )}
      {...props}
    />
  );
}
