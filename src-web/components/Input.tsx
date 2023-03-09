import classnames from 'classnames';
import type { InputHTMLAttributes, ReactNode } from 'react';
import type { EditorProps } from './Editor/Editor';
import Editor from './Editor/Editor';
import { HStack, VStack } from './Stacks';

interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'onChange' | 'onSubmit' | 'defaultValue'
  > {
  name: string;
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
  useEditor?: Pick<EditorProps, 'contentType' | 'useTemplating' | 'valueKey'>;
  defaultValue?: string;
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
  onChange,
  placeholder,
  size = 'md',
  useEditor,
  name,
  leftSlot,
  rightSlot,
  defaultValue,
  ...props
}: Props) {
  const id = `input-${name}`;
  const inputClassName = classnames(
    className,
    '!bg-transparent pl-3 pr-2 min-w-0 h-full w-full focus:outline-none placeholder:text-placeholder',
    leftSlot && '!pl-0.5',
    rightSlot && '!pr-0.5',
  );

  return (
    <VStack>
      <label
        htmlFor={id}
        className={classnames(
          labelClassName,
          'font-semibold text-sm uppercase text-gray-700',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>
      <HStack
        items="center"
        className={classnames(
          containerClassName,
          'relative w-full rounded-md text-gray-900',
          'border border-gray-200 focus-within:border-blue-400/40',
          size === 'md' && 'h-10',
          size === 'sm' && 'h-8',
        )}
      >
        {leftSlot}
        {useEditor ? (
          <Editor
            id={id}
            singleLine
            defaultValue={defaultValue}
            placeholder={placeholder}
            onChange={onChange}
            className={inputClassName}
            {...props}
            {...useEditor}
          />
        ) : (
          <input
            id={id}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className={inputClassName}
            {...props}
          />
        )}
        {rightSlot}
      </HStack>
    </VStack>
  );
}
