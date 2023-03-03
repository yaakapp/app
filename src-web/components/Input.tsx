import classnames from "classnames";
import type { InputHTMLAttributes, ReactNode } from "react";
import Editor from "./Editor/Editor";
import { HStack, VStack } from "./Stacks";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  name: string;
  label: string;
  hideLabel?: boolean;
  labelClassName?: string;
  containerClassName?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  contentType?: string;
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
  placeholder,
  useTemplating,
  size = 'md',
  useEditor,
  contentType,
  onChange,
  name,
  leftSlot,
  rightSlot,
  defaultValue,
  ...props
}: Props) {
  const id = `input-${name}`;
  return (
    <VStack>
      <label
        htmlFor={id}
        className={classnames(
          labelClassName,
          'font-semibold text-sm uppercase text-gray-700 absolute',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>
      <HStack
        items="center"
        className={classnames(
          containerClassName,
          'relative w-full bg-gray-50 rounded-md overflow-hidden text-gray-900',
          'border border-transparent focus-within:border-blue-400/40',
          size === 'md' && 'h-10',
          size === 'sm' && 'h-8',
        )}
      >
        {leftSlot}
        {useEditor ? (
          <Editor
            id={id}
            singleLine
            contentType={contentType ?? 'text/plain'}
            useTemplating={useTemplating}
            defaultValue={defaultValue}
            onChange={onChange}
            onSubmit={onSubmit}
            placeholder={placeholder}
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
            placeholder={placeholder}
            defaultValue={defaultValue}
            className={classnames(
              className,
              'bg-transparent min-w-0 pl-3 pr-2 h-full w-full focus:outline-none',
              leftSlot && '!pl-1',
              rightSlot && '!pr-1',
            )}
            {...props}
          />
        )}
        {rightSlot}
      </HStack>
    </VStack>
  );
}
