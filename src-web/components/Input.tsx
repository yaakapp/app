import type { InputHTMLAttributes, ReactNode } from 'react';
import classnames from 'classnames';
import { HStack, VStack } from './Stacks';
import Editor from './Editor/Editor';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  name: string;
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  useTemplating?: boolean;
  useEditor?: boolean;
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
  onSubmit,
  useTemplating,
  size = 'md',
  useEditor,
  onChange,
  name,
  leftSlot,
  rightSlot,
  defaultValue,
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
        {useEditor ? (
          <Editor
            id={id}
            singleLine
            useTemplating
            contentType="url"
            defaultValue={defaultValue}
            onChange={onChange}
            onSubmit={onSubmit}
            className={classnames(
              className,
              'bg-transparent min-w-0 pl-3 pr-2 h-full w-full focus:outline-none',
              leftSlot && '!pl-1',
              rightSlot && '!pr-1',
            )}
          />
        ) : (
          <input
            id={id}
            onChange={(e) => onChange?.(e.target.value)}
            className={classnames(
              className,
              'bg-transparent min-w-0 pl-3 pr-2 h-full w-full focus:outline-none',
              leftSlot && '!pl-1',
              rightSlot && '!pr-1',
            )}
            {...props}
          />
        )}
      </VStack>
      {rightSlot}
    </HStack>
  );
}
