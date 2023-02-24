import { InputHTMLAttributes, ReactNode } from 'react';
import classnames from 'classnames';
import { HStack, VStack } from './Stacks';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  name: string;
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
  containerClassName?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  size?: 'sm' | 'md';
}

export function Input({
  label,
  hideLabel,
  className,
  containerClassName,
  labelClassName,
  size = 'md',
  name,
  leftSlot,
  rightSlot,
  ...props
}: Props) {
  const id = `input-${name}`;
  return (
    <HStack
      items="center"
      className={classnames(
        containerClassName,
        'w-full bg-gray-50 rounded-md text-sm overflow-hidden text-gray-900',
        'border border-transparent focus-within:border-blue-400/40',
        size === 'md' && 'h-10',
        size === 'sm' && 'h-8',
      )}
    >
      {leftSlot}
      <VStack className="w-full">
        <label
          htmlFor={name}
          className={classnames(
            labelClassName,
            'font-semibold text-sm uppercase text-gray-700',
            hideLabel && 'sr-only',
          )}
        >
          {label}
        </label>
        <input
          id={id}
          className={classnames(
            className,
            'bg-transparent min-w-0 pl-3 pr-2 h-full w-full focus:outline-none',
            leftSlot && '!pl-1',
            rightSlot && '!pr-1',
          )}
          {...props}
        />
      </VStack>
      {rightSlot}
    </HStack>
  );
}
