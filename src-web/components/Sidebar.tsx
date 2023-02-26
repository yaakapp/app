import React, { HTMLAttributes } from 'react';
import classnames from 'classnames';
import { IconButton } from './IconButton';
import { Button } from './Button';
import useTheme from '../hooks/useTheme';
import { HStack } from './Stacks';
import { WindowDragRegion } from './WindowDragRegion';
import { Request } from '../hooks/useWorkspaces';
import { invoke } from '@tauri-apps/api';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  workspaceId: string;
  requests: Request[];
}

export function Sidebar({ className, workspaceId, requests, ...props }: Props) {
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
      <ul className="mx-2 py-2">
        {requests.map((r) => (
          <li key={r.id}>
            <Button
              className={classnames('w-full', false && 'bg-gray-50')}
              size="sm"
              justify="start"
            >
              {r.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
