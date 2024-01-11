import classNames from 'classnames';
import type { EditorView } from 'codemirror';
import type { FormEvent } from 'react';
import { memo, useCallback, useRef, useState } from 'react';
import { useHotKey } from '../hooks/useHotKey';
import { useIsResponseLoading } from '../hooks/useIsResponseLoading';
import { useRequestUpdateKey } from '../hooks/useRequestUpdateKey';
import { useSendRequest } from '../hooks/useSendRequest';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import type { HttpRequest } from '../lib/models';
import { IconButton } from './core/IconButton';
import { Input } from './core/Input';
import { RequestMethodDropdown } from './RequestMethodDropdown';

type Props = Pick<HttpRequest, 'id' | 'url' | 'method'> & {
  className?: string;
};

export const UrlBar = memo(function UrlBar({ id: requestId, url, method, className }: Props) {
  const inputRef = useRef<EditorView>(null);
  const sendRequest = useSendRequest(requestId);
  const updateRequest = useUpdateRequest(requestId);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const handleMethodChange = useCallback(
    (method: string) => updateRequest.mutate({ method }),
    [updateRequest],
  );
  const handleUrlChange = useCallback(
    (url: string) => updateRequest.mutate({ url }),
    [updateRequest],
  );
  const loading = useIsResponseLoading(requestId);
  const { updateKey } = useRequestUpdateKey(requestId);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      sendRequest.mutate();
    },
    [sendRequest],
  );

  useHotKey('urlBar.focus', () => {
    const head = inputRef.current?.state.doc.length ?? 0;
    inputRef.current?.dispatch({
      selection: { anchor: 0, head },
    });
    inputRef.current?.focus();
  });

  return (
    <form onSubmit={handleSubmit} className={classNames('url-bar', className)}>
      <Input
        autocompleteVariables
        ref={inputRef}
        size={isFocused ? 'auto' : 'sm'}
        hideLabel
        useTemplating
        contentType="url"
        className="px-0 py-0.5"
        name="url"
        label="Enter URL"
        forceUpdateKey={updateKey}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        containerClassName="shadow shadow-gray-100 dark:shadow-gray-50"
        onChange={handleUrlChange}
        defaultValue={url}
        placeholder="https://example.com"
        leftSlot={
          <RequestMethodDropdown
            method={method}
            onChange={handleMethodChange}
            className="!h-auto mx-0.5 my-0.5"
          />
        }
        rightSlot={
          <IconButton
            size="xs"
            iconSize="sm"
            title="Send Request"
            type="submit"
            className="!h-auto w-8 mr-0.5 my-0.5"
            icon={loading ? 'update' : 'paperPlane'}
            spin={loading}
            hotkeyAction="request.send"
          />
        }
      />
    </form>
  );
});
