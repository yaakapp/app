import classnames from 'classnames';
import type { HTMLAttributes } from 'react';
import { forwardRef, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

const colorStyles = {
  custom: '',
  default: 'text-gray-700 enabled:hocus:bg-gray-700/10 enabled:hocus:text-gray-1000',
  gray: 'text-gray-800 bg-highlight enabled:hocus:bg-gray-500/20 enabled:hocus:text-gray-1000',
  primary: 'bg-blue-400 text-white enabled:hocus:bg-blue-500',
  secondary: 'bg-violet-400 text-white enabled:hocus:bg-violet-500',
  warning: 'bg-orange-400 text-white enabled:hocus:bg-orange-500',
  danger: 'bg-red-400 text-white enabled:hocus:bg-red-500',
};

export type ButtonProps = HTMLAttributes<HTMLElement> & {
  to?: string;
  color?: keyof typeof colorStyles;
  size?: 'sm' | 'md' | 'xs';
  justify?: 'start' | 'center';
  type?: 'button' | 'submit';
  forDropdown?: boolean;
  disabled?: boolean;
  title?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _Button = forwardRef<any, ButtonProps>(function Button(
  {
    to,
    className,
    children,
    forDropdown,
    color,
    justify = 'center',
    size = 'md',
    ...props
  }: ButtonProps,
  ref,
) {
  const classes = useMemo(
    () =>
      classnames(
        className,
        'outline-none whitespace-nowrap',
        // 'border border-transparent focus-visible:border-focus',
        'focus-visible-or-class:ring ring-blue-300',
        'rounded-md flex items-center',
        colorStyles[color || 'default'],
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        size === 'md' && 'h-md px-3',
        size === 'sm' && 'h-sm px-2.5 text-sm',
        size === 'xs' && 'h-xs px-2 text-sm',
      ),
    [color, size, justify, className],
  );

  if (typeof to === 'string') {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {children}
        {forDropdown && <Icon icon="chevronDown" className="ml-1 -mr-1" />}
      </Link>
    );
  } else {
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
        {forDropdown && <Icon icon="chevronDown" size="sm" className="ml-1 -mr-1" />}
      </button>
    );
  }
});

export const Button = memo(_Button);
