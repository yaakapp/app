import type { EditorView } from 'codemirror';
import type { FormEvent } from 'react';
import { memo, useRef, useState } from 'react';
import { useHotKey } from '../hooks/useHotKey';
import type { HttpRequest } from '../lib/models';
import type { IconProps } from './core/Icon';
import { IconButton } from './core/IconButton';
import { Input } from './core/Input';
import { RequestMethodDropdown } from './RequestMethodDropdown';

type Props = Pick<HttpRequest, 'url'> & {
  className?: string;
  method: HttpRequest['method'] | null;
  placeholder: string;
  onSubmit: (e: FormEvent) => void;
  onUrlChange: (url: string) => void;
  submitIcon?: IconProps['icon'] | null;
  onMethodChange?: (method: string) => void;
  isLoading: boolean;
  forceUpdateKey: string;
};

export const UrlBar = memo(function UrlBar({
  forceUpdateKey,
  onUrlChange,
  url,
  method,
  placeholder,
  className,
  onSubmit,
  onMethodChange,
  submitIcon = 'sendHorizontal',
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

  return (
    <form onSubmit={onSubmit} className={className}>
      <Input
        autocompleteVariables
        ref={inputRef}
        size="sm"
        wrapLines={isFocused}
        hideLabel
        useTemplating
        contentType="url"
        className="px-0 py-0.5"
        name="url"
        label="Enter URL"
        forceUpdateKey={forceUpdateKey}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        containerClassName="shadow shadow-gray-100 dark:shadow-gray-50"
        onChange={onUrlChange}
        defaultValue={url}
        placeholder={placeholder}
        leftSlot={
          method != null &&
          onMethodChange != null && (
            <RequestMethodDropdown
              method={method}
              onChange={onMethodChange}
              className="!h-auto my-0.5 mr-0.5"
            />
          )
        }
        rightSlot={
          submitIcon !== null && (
            <IconButton
              size="xs"
              iconSize="md"
              title="Send Request"
              type="submit"
              className="w-8 !h-auto my-0.5 mr-0.5"
              icon={isLoading ? 'update' : submitIcon}
              spin={isLoading}
              hotkeyAction="http_request.send"
            />
          )
        }
      />
    </form>
  );
});
