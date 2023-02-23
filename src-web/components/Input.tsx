import { InputHTMLAttributes, ReactNode } from 'react';
import classnames from 'classnames';
import { HStack, VStack } from './Stacks';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export function Input({
  label,
  labelClassName,
  hideLabel,
  className,
  name,
  leftSlot,
  rightSlot,
  ...props
}: Props) {
  const id = `input-${name}`;
  return (
    <HStack items="center" className="w-full bg-gray-50 h-10 rounded-md text-sm ">
      {leftSlot}
      <VStack
        className={classnames(
          'w-full border-gray-100/50',
          leftSlot && 'border-l ml-0.5',
          rightSlot && 'border-r mr-0.5',
        )}
      >
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
            'bg-transparent min-w-0 pl-3 pr-2 w-full h-full focus:outline-none',
          )}
          {...props}
        />
      </VStack>
      {rightSlot}
    </HStack>
  );
}
