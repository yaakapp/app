import { InputHTMLAttributes } from 'react';
import classnames from 'classnames';
import { VStack } from './Stacks';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
  containerClassName?: string;
}

export function Input({
  label,
  containerClassName,
  labelClassName,
  hideLabel,
  className,
  name,
  ...props
}: Props) {
  const id = `input-${name}`;
  return (
    <VStack className={classnames(containerClassName, 'w-full')}>
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
          'w-0 min-w-[100%] bg-gray-50 h-10 pl-3 pr-2 rounded-md text-sm focus:outline-none',
        )}
        {...props}
      />
    </VStack>
  );
}
