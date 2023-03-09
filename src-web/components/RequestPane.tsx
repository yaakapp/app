import classnames from 'classnames';
import { useRequestUpdate, useSendRequest } from '../hooks/useRequest';
import type { HttpRequest } from '../lib/models';
import { Button } from './Button';
import { Editor } from './Editor/Editor';
import { ScrollArea } from './ScrollArea';
import { HStack } from './Stacks';
import { UrlBar } from './UrlBar';

interface Props {
  request: HttpRequest;
  fullHeight: boolean;
  className?: string;
}

export function RequestPane({ fullHeight, request, className }: Props) {
  const updateRequest = useRequestUpdate(request ?? null);
  const sendRequest = useSendRequest(request ?? null);
  return (
    <div
      className={classnames(className, 'py-2 grid grid-rows-[auto_auto_minmax(0,1fr)] grid-cols-1')}
    >
      <div className="pl-2">
        <UrlBar
          key={request.id}
          method={request.method}
          url={request.url}
          loading={sendRequest.isLoading}
          onMethodChange={(method) => updateRequest.mutate({ method })}
          onUrlChange={(url) => updateRequest.mutate({ url })}
          sendRequest={sendRequest.mutate}
        />
        {/*<Divider />*/}
      </div>
      {/*<Divider className="mb-2" />*/}
      <ScrollArea className="max-w-full pb-2 mx-2">
        <HStack className="mt-2 hide-scrollbar" space={1}>
          {['JSON', 'Params', 'Headers', 'Auth'].map((label, i) => (
            <Button
              key={label}
              size="sm"
              color={i === 0 ? 'gray' : undefined}
              className={i !== 0 ? 'opacity-80 hover:opacity-100' : undefined}
            >
              {label}
            </Button>
          ))}
        </HStack>
      </ScrollArea>
      <Editor
        className="mt-1 !bg-gray-50"
        heightMode={fullHeight ? 'full' : 'auto'}
        valueKey={request.id}
        useTemplating
        defaultValue={request.body ?? ''}
        contentType="application/json"
        onChange={(body) => updateRequest.mutate({ body })}
      />
    </div>
  );
}
