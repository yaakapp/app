import { useCreateFolder } from '../hooks/useCreateFolder';
import { useCreateGrpcRequest } from '../hooks/useCreateGrpcRequest';
import { useCreateHttpRequest } from '../hooks/useCreateHttpRequest';
import { BODY_TYPE_GRAPHQL } from '../lib/models';
import type { DropdownItem, DropdownProps } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';

interface Props {
  hideFolder?: boolean;
  children: DropdownProps['children'];
  openOnHotKeyAction?: DropdownProps['openOnHotKeyAction'];
}

export function CreateDropdown({ hideFolder, children, openOnHotKeyAction }: Props) {
  const createHttpRequest = useCreateHttpRequest();
  const createGrpcRequest = useCreateGrpcRequest();
  const createFolder = useCreateFolder();

  return (
    <Dropdown
      openOnHotKeyAction={openOnHotKeyAction}
      items={[
        {
          key: 'create-http-request',
          label: 'HTTP Request',
          onSelect: () => createHttpRequest.mutate({}),
        },
        {
          key: 'create-graphql-request',
          label: 'GraphQL Query',
          onSelect: () => createHttpRequest.mutate({ bodyType: BODY_TYPE_GRAPHQL, method: 'POST' }),
        },
        {
          key: 'create-grpc-request',
          label: 'gRPC Call',
          onSelect: () => createGrpcRequest.mutate({}),
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
                onSelect: () => createFolder.mutate({}),
              },
            ]) as DropdownItem[]),
      ]}
    >
      {children}
    </Dropdown>
  );
}
