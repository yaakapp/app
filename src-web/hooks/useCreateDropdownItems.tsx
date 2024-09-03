import { useMemo } from 'react';
import type { DropdownItem } from '../components/core/Dropdown';
import { Icon } from '../components/core/Icon';
import { BODY_TYPE_GRAPHQL } from '../lib/models';
import { useCreateFolder } from './useCreateFolder';
import { useCreateGrpcRequest } from './useCreateGrpcRequest';
import { useCreateHttpRequest } from './useCreateHttpRequest';

export function useCreateDropdownItems({
  hideFolder,
  hideIcons,
  folderId,
}: {
  hideFolder?: boolean;
  hideIcons?: boolean;
  folderId?: string | null;
} = {}): DropdownItem[] {
  const createHttpRequest = useCreateHttpRequest();
  const createGrpcRequest = useCreateGrpcRequest();
  const createFolder = useCreateFolder();

  return useMemo<DropdownItem[]>(
    () => [
      {
        key: 'create-http-request',
        label: 'HTTP Request',
        leftSlot: hideIcons ? undefined : <Icon icon="plus" />,
        onSelect: () => createHttpRequest.mutate({ folderId }),
      },
      {
        key: 'create-graphql-request',
        label: 'GraphQL Query',
        leftSlot: hideIcons ? undefined : <Icon icon="plus" />,
        onSelect: () =>
          createHttpRequest.mutate({
            folderId,
            bodyType: BODY_TYPE_GRAPHQL,
            method: 'POST',
            headers: [{ name: 'Content-Type', value: 'application/json' }],
          }),
      },
      {
        key: 'create-grpc-request',
        label: 'gRPC Call',
        leftSlot: hideIcons ? undefined : <Icon icon="plus" />,
        onSelect: () => createGrpcRequest.mutate({ folderId }),
      },
      ...((hideFolder
        ? []
        : [
            {
              type: 'separator',
            },
            {
              key: 'create-folder',
              label: 'Folder',
              leftSlot: hideIcons ? undefined : <Icon icon="plus" />,
              onSelect: () => createFolder.mutate({ folderId }),
            },
          ]) as DropdownItem[]),
    ],
    [createFolder, createGrpcRequest, createHttpRequest, folderId, hideFolder, hideIcons],
  );
}
