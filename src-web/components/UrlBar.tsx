import classnames from 'classnames';
import type { FormEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useIsResponseLoading } from '../hooks/useIsResponseLoading';
import { useSendRequest } from '../hooks/useSendRequest';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import type { HttpRequest } from '../lib/models';
import { IconButton } from './core/IconButton';
import { Input } from './core/Input';
import { RequestMethodDropdown } from './RequestMethodDropdown';

interface Props {
  request: HttpRequest;
  className?: string;
}

export const UrlBar = memo(function UrlBar({ request, className }: Props) {
  const sendRequest = useSendRequest(request.id);
  const updateRequest = useUpdateRequest(request.id);
  const handleMethodChange = useCallback((method: string) => updateRequest.mutate({ method }), []);
  const handleUrlChange = useCallback((url: string) => updateRequest.mutate({ url }), []);
  const loading = useIsResponseLoading(request.id);
  const useEditor = useMemo(() => ({ useTemplating: true, contentType: 'url' }), []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      sendRequest();
    },
    [sendRequest],
  );

  return (
    <form onSubmit={handleSubmit} className={classnames(className, 'w-full flex items-center')}>
      <Input
        key={request.id}
        hideLabel
        useEditor={useEditor}
        className="px-0"
        name="url"
        label="Enter URL"
        containerClassName="shadow shadow-gray-100 dark:shadow-gray-0"
        onChange={handleUrlChange}
        defaultValue={request.url}
        placeholder="Enter a URL..."
        leftSlot={<RequestMethodDropdown method={request.method} onChange={handleMethodChange} />}
        rightSlot={
          <IconButton
            title="Send Request"
            type="submit"
            color="custom"
            className="!px-2 mr-0.5"
            icon={loading ? 'update' : 'paperPlane'}
            spin={loading}
            disabled={loading}
          />
        }
      />
    </form>
  );
});
