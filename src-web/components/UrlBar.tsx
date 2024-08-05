import classNames from 'classnames';
import type { EditorView } from 'codemirror';
import type { FormEvent, ReactNode } from 'react';
import { memo, useRef, useState } from 'react';
import { useHotKey } from '../hooks/useHotKey';
import type { HttpRequest } from '@yaakapp/api';
import type { IconProps } from './core/Icon';
import { IconButton } from './core/IconButton';
import type { InputProps } from './core/Input';
import { Input } from './core/Input';
import { RequestMethodDropdown } from './RequestMethodDropdown';

type Props = Pick<HttpRequest, 'url'> & {
  className?: string;
  method: HttpRequest['method'] | null;
  placeholder: string;
  onSend: () => void;
  onUrlChange: (url: string) => void;
  onPaste?: (v: string) => void;
  onCancel: () => void;
  submitIcon?: IconProps['icon'] | null;
  onMethodChange?: (method: string) => void;
  isLoading: boolean;
  forceUpdateKey: string;
  rightSlot?: ReactNode;
  autocomplete?: InputProps['autocomplete'];
};

export const UrlBar = memo(function UrlBar({
  forceUpdateKey,
  onUrlChange,
  url,
  method,
  placeholder,
  className,
  onSend,
  onCancel,
  onMethodChange,
  onPaste,
  submitIcon = 'sendHorizontal',
  autocomplete,
  rightSlot,
  isLoading,
}: Props) {
  const inputRef = useRef<EditorView>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useHotKey('urlBar.focus', () => {
    const head = inputRef.current?.state.doc.length ?? 0;
    inputRef.current?.dispatch({
      selection: { anchor: 0, head },
    });
    inputRef.current?.focus();
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    isLoading ? onCancel() : onSend();
  };

  return (
    <form onSubmit={handleSubmit} className={classNames('x-theme-urlBar', className)}>
      <Input
        autocompleteVariables
        ref={inputRef}
        size="sm"
        wrapLines={isFocused}
        hideLabel
        useTemplating
        contentType="url"
        className="pl-0 pr-1.5 py-0.5"
        name="url"
        label="Enter URL"
        autocomplete={autocomplete}
        forceUpdateKey={forceUpdateKey}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={onPaste}
        containerClassName="bg-background border border-background-highlight"
        onChange={onUrlChange}
        defaultValue={url}
        placeholder={placeholder}
        leftSlot={
          method != null &&
          onMethodChange != null && (
            <RequestMethodDropdown
              method={method}
              onChange={onMethodChange}
              className="my-0.5 ml-0.5"
            />
          )
        }
        rightSlot={
          <>
            {rightSlot}
            {submitIcon !== null && (
              <IconButton
                size="xs"
                iconSize="md"
                title="Send Request"
                type="submit"
                className="w-8 my-0.5 mr-0.5"
                icon={isLoading ? 'x' : submitIcon}
                hotkeyAction="http_request.send"
              />
            )}
          </>
        }
      />
    </form>
  );
});
