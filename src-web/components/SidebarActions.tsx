import { memo } from 'react';
import { useCookieJars } from '../hooks/useCookieJars';
import { useCreateCookieJar } from '../hooks/useCreateCookieJar';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { trackEvent } from '../lib/analytics';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { useDialog } from './DialogContext';

export const SidebarActions = memo(function SidebarActions() {
  const createRequest = useCreateRequest();
  const createFolder = useCreateFolder();
  const createCookieJar = useCreateCookieJar();
  const { hidden, toggle } = useSidebarHidden();
  const cookieJars = useCookieJars();
  const dialog = useDialog();

  return (
    <HStack>
      <IconButton
        onClick={() => {
          trackEvent('Sidebar', 'Toggle');
          toggle();
        }}
        className="pointer-events-auto"
        size="sm"
        title="Show sidebar"
        hotkeyAction="sidebar.toggle"
        icon={hidden ? 'leftPanelHidden' : 'leftPanelVisible'}
      />
      <Dropdown
        items={[
          {
            key: 'create-request',
            label: 'New Request',
            hotKeyAction: 'request.create',
            onSelect: () => createRequest.mutate({}),
          },
          {
            key: 'create-folder',
            label: 'New Folder',
            onSelect: () => createFolder.mutate({}),
          },
          {
            key: 'create-cookie-jar',
            label: 'New Cookie Jar',
            onSelect: () => createCookieJar.mutate(),
          },
        ]}
      >
        <IconButton size="sm" icon="plusCircle" title="Add Resource" />
      </Dropdown>

      <Dropdown
        items={[
          ...cookieJars.map((j, i) => ({
            key: j.id,
            label: j.name,
            leftSlot: <Icon icon={i === 0 ? 'check' : 'empty'} />,
            onSelect: () => {
              console.log('SELECT COOKIE JAR', j);
            },
          })),
          { type: 'separator' },
          {
            key: 'manage',
            label: 'Manage Cookies',
            leftSlot: <Icon icon="cookie" />,
            onSelect: () => {
              dialog.show({
                id: 'cookies',
                title: 'Manage Cookies',
                render: () => <div>Hello</div>,
              });
            },
          },
        ]}
      >
        <IconButton size="sm" icon="cookie" title="Cookie Jar" />
      </Dropdown>
      {/*<IconButton*/}
      {/*  title="Manage cookies"*/}
      {/*  size="sm"*/}
      {/*  icon="cookie"*/}
      {/*  onClick={() => {*/}
      {/*    console.log('MANAGE COOKIES');*/}
      {/*    dialog.show({*/}
      {/*      id: 'cookies',*/}
      {/*      title: 'Manage Cookies',*/}
      {/*      render: () => <div>{cookie}</div>,*/}
      {/*    });*/}
      {/*  }}*/}
      {/*/>*/}
    </HStack>
  );
});
