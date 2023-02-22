import { ButtonHTMLAttributes, forwardRef } from 'react';
import classnames from 'classnames';
import { Icon } from './Icon';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  justify?: 'start' | 'center';
  forDropdown?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    justify = 'center',
    children,
    size = 'md',
    forDropdown,
    color,
    ...props
  }: ButtonProps,
  ref,
) {
  return (
    <button
      ref={ref}
      className={classnames(
        className,
        'rounded-md flex items-center',
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        size === 'md' && 'h-10 px-4',
        size === 'sm' && 'h-8 px-3 text-sm',
        color === undefined && 'hover:bg-gray-500/[0.1] active:bg-gray-500/[0.15] text-gray-700',
        color === 'primary' && 'bg-blue-500 hover:bg-blue-500/90 active:bg-blue-500/80 text-white',
        color === 'secondary' &&
          'bg-violet-500 hover:bg-violet-500/90 active:bg-violet-500/80 text-white',
      )}
      {...props}
    >
      {children}
      {forDropdown && <Icon icon="triangle-down" className="ml-1 -mr-1" />}
    </button>
  );
});
