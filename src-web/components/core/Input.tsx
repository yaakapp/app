import classnames from 'classnames';
import type { HTMLAttributes, ReactNode } from 'react';
import type { EditorProps } from './Editor';
import { Editor } from './Editor';
import { HStack, VStack } from './Stacks';

type Props = Omit<HTMLAttributes<HTMLInputElement>, 'onChange' | 'onFocus'> & {
  name: string;
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  useEditor?: Pick<EditorProps, 'contentType' | 'useTemplating' | 'autocomplete'>;
  defaultValue?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
};

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
    !!leftSlot && '!pl-0.5',
    !!rightSlot && '!pr-0.5',
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
        alignItems="center"
        className={classnames(
          containerClassName,
          'relative w-full rounded-md text-gray-900',
          'border border-gray-200 focus-within:border-focus',
          size === 'md' && 'h-9',
          size === 'sm' && 'h-7',
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
            onChange={(e) => onChange?.(e.currentTarget.value)}
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
