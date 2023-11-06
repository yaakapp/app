import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef, memo, useMemo } from 'react';
import { Icon } from './Icon';

const colorStyles = {
  custom: 'ring-blue-500/50',
  default:
    'text-gray-700 enabled:hocus:bg-gray-700/10 enabled:hocus:text-gray-1000 ring-blue-500/50',
  gray: 'text-gray-800 bg-highlight enabled:hocus:bg-gray-500/20 enabled:hocus:text-gray-1000 ring-blue-500/50',
  primary: 'bg-blue-400 text-white enabled:hocus:bg-blue-500 ring-blue-500/50',
  secondary: 'bg-violet-400 text-white enabled:hocus:bg-violet-500 ring-violet-500/50',
  warning: 'bg-orange-400 text-white enabled:hocus:bg-orange-500 ring-orange-500/50',
  danger: 'bg-red-400 text-white enabled:hocus:bg-red-500 ring-red-500/50',
};

export type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  innerClassName?: string;
  color?: keyof typeof colorStyles;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'xs';
  justify?: 'start' | 'center';
  type?: 'button' | 'submit';
  forDropdown?: boolean;
  disabled?: boolean;
  title?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    isLoading,
    className,
    innerClassName,
    children,
    forDropdown,
    color,
    type = 'button',
    justify = 'center',
    size = 'md',
    leftSlot,
    rightSlot,
    disabled,
    ...props
  }: ButtonProps,
  ref,
) {
  const classes = useMemo(
    () =>
      classNames(
        className,
        'max-w-full min-w-0', // Help with truncation
        'whitespace-nowrap outline-none',
        'flex-shrink-0 flex items-center',
        'focus-visible-or-class:ring rounded-md',
        disabled ? 'pointer-events-none opacity-disabled' : 'pointer-events-auto',
        colorStyles[color || 'default'],
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        size === 'md' && 'h-md px-3',
        size === 'sm' && 'h-sm px-2.5 text-sm',
        size === 'xs' && 'h-xs px-2 text-sm',
      ),
    [className, disabled, color, justify, size],
  );

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled} {...props}>
      {isLoading ? (
        <Icon icon="update" size={size} className="animate-spin mr-1" />
      ) : leftSlot ? (
        <div className="mr-1">{leftSlot}</div>
      ) : null}
      <div
        className={classNames(
          'max-w-[15em] truncate w-full',
          justify === 'start' ? 'text-left' : 'text-center',
          innerClassName,
        )}
      >
        {children}
      </div>
      {rightSlot && <div className="ml-1">{rightSlot}</div>}
      {forDropdown && <Icon icon="chevronDown" size={size} className="ml-1 -mr-1" />}
    </button>
  );
});

export const Button = memo(_Button);
