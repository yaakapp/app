import React, { HTMLAttributes } from 'react';
import classnames from 'classnames';
import { IconButton } from './IconButton';
import { Button } from './Button';
import useTheme from '../hooks/useTheme';
import { HStack, VStack } from './Stacks';
import { WindowDragRegion } from './WindowDragRegion';
import { Request } from '../hooks/useWorkspaces';
import { invoke } from '@tauri-apps/api';
import { Link } from 'react-router-dom';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  workspaceId: string;
  requests: Request[];
  requestId?: string;
}

export function Sidebar({ className, requestId, workspaceId, requests, ...props }: Props) {
  const { toggleTheme } = useTheme();
  return (
    <div
      className={classnames(className, 'w-52 bg-gray-50/40 h-full border-gray-500/10')}
      {...props}
    >
      <HStack as={WindowDragRegion} items="center" className="pr-1" justify="end">
        <IconButton size="sm" icon="sun" onClick={toggleTheme} />
        <IconButton
          size="sm"
          icon="camera"
          onClick={async () => {
            const req = await invoke('upsert_request', {
              workspaceId,
              id: null,
              name: 'Test Request',
            });
            console.log('UPSERTED', req);
          }}
        />
      </HStack>
      <VStack as="ul" className="py-2" space={1}>
        {requests.map((r) => (
          <li key={r.id} className="mx-2">
            <Button
              as={Link}
              to={`/workspaces/${workspaceId}/requests/${r.id}`}
              className={classnames('w-full', requestId === r.id && 'bg-gray-50')}
              size="sm"
              justify="start"
            >
              {r.name}
            </Button>
          </li>
        ))}
      </VStack>
    </div>
  );
}
