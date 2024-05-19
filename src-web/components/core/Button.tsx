import classNames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { HotkeyAction } from '../../hooks/useHotKey';
import { useFormattedHotkey, useHotKey } from '../../hooks/useHotKey';
import { Icon } from './Icon';

export type ButtonProps = Omit<HTMLAttributes<HTMLButtonElement>, 'color'> & {
  innerClassName?: string;
  color?:
    | 'custom'
    | 'default'
    | 'secondary'
    | 'primary'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger';
  variant?: 'border' | 'solid';
  isLoading?: boolean;
  size?: 'xs' | 'sm' | 'md';
  justify?: 'start' | 'center';
  type?: 'button' | 'submit';
  forDropdown?: boolean;
  disabled?: boolean;
  title?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  hotkeyAction?: HotkeyAction;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    isLoading,
    className,
    innerClassName,
    children,
    forDropdown,
    color = 'default',
    type = 'button',
    justify = 'center',
    size = 'md',
    variant = 'solid',
    leftSlot,
    rightSlot,
    disabled,
    hotkeyAction,
    title,
    onClick,
    ...props
  }: ButtonProps,
  ref,
) {
  const hotkeyTrigger = useFormattedHotkey(hotkeyAction ?? null)?.join('');
  const fullTitle = hotkeyTrigger ? `${title}  ${hotkeyTrigger}` : title;

  const classes = classNames(
    className,
    'x-theme-button',
    `x-theme-button--${variant}--${color}`,
    `x-theme-button--${variant}`,
    'text-fg',
    'max-w-full min-w-0', // Help with truncation
    'hocus:opacity-100', // Force opacity for certain hover effects
    'whitespace-nowrap outline-none',
    'flex-shrink-0 flex items-center',
    'focus-visible-or-class:ring rounded-md',
    disabled ? 'pointer-events-none opacity-disabled' : 'pointer-events-auto',
    justify === 'start' && 'justify-start',
    justify === 'center' && 'justify-center',
    size === 'md' && 'h-md px-3',
    size === 'sm' && 'h-sm px-2.5 text-sm',
    size === 'xs' && 'h-xs px-2 text-sm',

    // Solids
    variant === 'solid' &&
      color !== 'custom' &&
      color !== 'default' &&
      'bg-background enabled:hocus:bg-background-highlight ring-background',
    variant === 'solid' && color === 'custom' && 'ring-blue-400',
    variant === 'solid' &&
      color === 'default' &&
      'enabled:hocus:bg-background-highlight ring-blue-400',

    // Borders
    variant === 'border' && 'border',
    variant === 'border' &&
      color !== 'custom' &&
      color !== 'default' &&
      'border-fg-subtler text-fg-subtle enabled:hocus:border-fg-subtle enabled:hocus:bg-background-highlight enabled:hocus:text-fg ring-fg-subtle',
    variant === 'border' &&
      color === 'default' &&
      'border-background-highlight enabled:hocus:border-fg-subtler enabled:hocus:bg-background-highlight-secondary',
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle<HTMLButtonElement | null, HTMLButtonElement | null>(
    ref,
    () => buttonRef.current,
  );

  useHotKey(hotkeyAction ?? null, () => {
    buttonRef.current?.click();
  });

  return (
    <button
      ref={buttonRef}
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      title={fullTitle}
      {...props}
    >
      {isLoading ? (
        <Icon icon="refresh" size={size} className="animate-spin mr-1" />
      ) : leftSlot ? (
        <div className="mr-1">{leftSlot}</div>
      ) : null}
      <div
        className={classNames(
          'truncate w-full',
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
