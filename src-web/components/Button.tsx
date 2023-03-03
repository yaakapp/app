import classnames from 'classnames';
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
} from 'react';
import { forwardRef } from 'react';
import { Icon } from './Icon';

export interface ButtonProps<T extends ElementType>
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'secondary' | 'warning' | 'danger';
  size?: 'xs' | 'sm' | 'md';
  justify?: 'start' | 'center';
  forDropdown?: boolean;
  as?: T;
}

export const Button = forwardRef(function Button<T extends ElementType>(
  {
    className,
    as,
    justify = 'center',
    children,
    size = 'md',
    forDropdown,
    color,
    ...props
  }: ButtonProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const Component = as || 'button';
  return (
    <Component
      ref={ref}
      type="button"
      className={classnames(
        className,
        'rounded-md flex items-center bg-opacity-80 hover:bg-opacity-100 text-white',
        // 'active:translate-y-[0.5px] active:scale-[0.99]',
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        size === 'md' && 'h-10 px-4',
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'xs' && 'h-7 px-3 text-sm',
        color === undefined && 'hover:bg-gray-500/[0.1]',
        color === 'primary' && 'bg-blue-400',
        color === 'secondary' && 'bg-violet-400',
        color === 'warning' && 'bg-orange-400',
        color === 'danger' && 'bg-red-400',
      )}
      {...props}
    >
      {children}
      {forDropdown && <Icon icon="triangle-down" className="ml-1 -mr-1" />}
    </Component>
  );
});
