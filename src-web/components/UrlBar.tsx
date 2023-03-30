import classnames from 'classnames';
import type { FormEvent } from 'react';
import { memo, useCallback } from 'react';
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
  const sendRequest = useSendRequest(requestId);
  const updateRequest = useUpdateRequest(requestId);
  const handleMethodChange = useCallback((method: string) => updateRequest.mutate({ method }), []);
  const handleUrlChange = useCallback((url: string) => updateRequest.mutate({ url }), []);
  const loading = useIsResponseLoading(requestId);
  const { updateKey } = useRequestUpdateKey(requestId);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      sendRequest();
    },
    [sendRequest],
  );

  return (
    <form onSubmit={handleSubmit} className={classnames('url-bar', className)}>
      <Input
        size="sm"
        hideLabel
        useTemplating
        contentType="url"
        className="px-0"
        name="url"
        label="Enter URL"
        forceUpdateKey={updateKey}
        containerClassName="shadow shadow-gray-100 dark:shadow-gray-50"
        onChange={handleUrlChange}
        defaultValue={url}
        placeholder="https://example.com"
        leftSlot={
          <RequestMethodDropdown
            method={method}
            onChange={handleMethodChange}
            className="mx-0.5 h-full my-1"
          />
        }
        rightSlot={
          <IconButton
            size="xs"
            iconSize="sm"
            title="Send Request"
            type="submit"
            className="w-8 mr-0.5"
            icon={loading ? 'update' : 'paperPlane'}
            spin={loading}
            disabled={loading}
          />
        }
      />
    </form>
  );
});
