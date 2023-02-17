import { InputHTMLAttributes } from 'react';
import classnames from 'classnames';
import { VStack } from './Stacks';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  labelClassName?: string;
}

export function Input({ label, labelClassName, className, name, ...props }: Props) {
  const id = `input-${name}`;
  return (
    <VStack>
      <label
        htmlFor={name}
        className={classnames(
          labelClassName,
          'font-semibold text-sm uppercase text-gray-700 dark:text-gray-300',
        )}
      >
        {label}
      </label>
      <input
        id={id}
        className={classnames(
          className,
          'border-2 border-gray-700 bg-gray-100 dark:bg-gray-800 h-10 px-5 rounded-lg text-sm focus:outline-none',
        )}
        {...props}
      />
    </VStack>
  );
}
