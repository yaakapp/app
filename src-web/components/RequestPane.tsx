import classnames from 'classnames';
import { useDeleteRequest, useRequestUpdate, useSendRequest } from '../hooks/useRequest';
import type { HttpRequest } from '../lib/models';
import { Button } from './Button';
import { Divider } from './Divider';
import Editor from './Editor/Editor';
import type { LayoutPaneProps } from './LayoutPane';
import { LayoutPane } from './LayoutPane';
import { ScrollArea } from './ScrollArea';
import { HStack } from './Stacks';
import { UrlBar } from './UrlBar';

interface Props extends LayoutPaneProps {
  request: HttpRequest;
}

export function RequestPane({ request, ...props }: Props) {
  const updateRequest = useRequestUpdate(request ?? null);
  const sendRequest = useSendRequest(request ?? null);
  return (
    <LayoutPane {...props}>
      <div className="h-full grid grid-rows-[auto_auto_minmax(0,1fr)] grid-cols-1 pt-1 pb-2">
        {/*<HStack as={WindowDragRegion} items="center" className="pl-3 pr-1.5">*/}
        {/*  Test Request*/}
        {/*  <IconButton size="sm" icon="trash" onClick={() => deleteRequest.mutate()} />*/}
        {/*</HStack>*/}
        <div>
          <UrlBar
            className="bg-transparent border-0 mb-1"
            key={request.id}
            method={request.method}
            url={request.url}
            loading={sendRequest.isLoading}
            onMethodChange={(method) => updateRequest.mutate({ method })}
            onUrlChange={(url) => updateRequest.mutate({ url })}
            sendRequest={sendRequest.mutate}
          />
          <div className="mx-2">
            <Divider />
          </div>
        </div>
        {/*<Divider className="mb-2" />*/}
        <ScrollArea className="max-w-full pb-2 mx-2">
          <HStack className="mt-2 hide-scrollbar" space={1}>
            {['JSON', 'Params', 'Headers', 'Auth', 'Docs'].map((label, i) => (
              <Button
                key={label}
                size="xs"
                color={i === 0 && 'gray'}
                className={i !== 0 && 'opacity-50 hover:opacity-60'}
              >
                {label}
              </Button>
            ))}
          </HStack>
        </ScrollArea>
        <div className="px-0">
          <Editor
            valueKey={request.id}
            useTemplating
            defaultValue={request.body ?? ''}
            contentType="application/json"
            onChange={(body) => updateRequest.mutate({ body })}
          />
        </div>
      </div>
    </LayoutPane>
  );
}
