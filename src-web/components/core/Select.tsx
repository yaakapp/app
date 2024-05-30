import classNames from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import { HStack } from './Stacks';

interface Props<T extends string> {
  name: string;
  label: string;
  labelPosition?: 'top' | 'left';
  labelClassName?: string;
  hideLabel?: boolean;
  value: T;
  leftSlot?: ReactNode;
  options: SelectOption<T>[] | SelectOptionGroup<T>[];
  onChange: (value: T) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export interface SelectOption<T extends string> {
  label: string;
  value: T;
}

export interface SelectOptionGroup<T extends string> {
  label: string;
  options: SelectOption<T>[];
}

export function Select<T extends string>({
  labelPosition = 'top',
  name,
  labelClassName,
  hideLabel,
  label,
  value,
  options,
  leftSlot,
  onChange,
  className,
  size = 'md',
}: Props<T>) {
  const [focused, setFocused] = useState<boolean>(false);
  const id = `input-${name}`;
  return (
    <div
      className={classNames(
        className,
        'x-theme-input',
        'w-full',
        'pointer-events-auto', // Just in case we're placing in disabled parent
        labelPosition === 'left' && 'flex items-center gap-2',
        labelPosition === 'top' && 'flex-row gap-0.5',
      )}
    >
      <label
        htmlFor={id}
        className={classNames(labelClassName, 'text-fg whitespace-nowrap', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <HStack
        space={2}
        className={classNames(
          'w-full rounded-md text-fg text-sm font-mono',
          'pl-2',
          'border',
          focused ? 'border-border-focus' : 'border-background-highlight',
          size === 'xs' && 'h-xs',
          size === 'sm' && 'h-sm',
          size === 'md' && 'h-md',
          size === 'lg' && 'h-lg',
        )}
      >
        {leftSlot && <div>{leftSlot}</div>}
        <select
          value={value}
          style={selectBackgroundStyles}
          onChange={(e) => onChange(e.target.value as T)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={classNames('pr-7 w-full outline-none bg-transparent')}
        >
          {options.map((o) =>
            'options' in o ? (
              <optgroup key={o.label} label={o.label}>
                {o.options.map(({ label, value }) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                ))}
              </optgroup>
            ) : (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ),
          )}
        </select>
      </HStack>
    </div>
  );
}

const selectBackgroundStyles: CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 0.3rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.5em 1.5em',
  appearance: 'none',
  printColorAdjust: 'exact',
};
