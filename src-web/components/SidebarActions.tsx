import { memo } from 'react';
import { useCookieJars } from '../hooks/useCookieJars';
import { useCreateCookieJar } from '../hooks/useCreateCookieJar';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useDeleteCookieJar } from '../hooks/useDeleteCookieJar';
import { usePrompt } from '../hooks/usePrompt';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { useUpdateCookieJar } from '../hooks/useUpdateCookieJar';
import { trackEvent } from '../lib/analytics';
import { CookieDialog } from './CookieDialog';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { InlineCode } from './core/InlineCode';
import { HStack } from './core/Stacks';
import { useDialog } from './DialogContext';

export const SidebarActions = memo(function SidebarActions() {
  const createRequest = useCreateRequest();
  const createFolder = useCreateFolder();
  const createCookieJar = useCreateCookieJar();
  const { hidden, toggle } = useSidebarHidden();
  const cookieJars = useCookieJars();
  const dialog = useDialog();
  const prompt = usePrompt();
  const activeCookieJar = cookieJars[0] ?? null;
  const updateCookieJar = useUpdateCookieJar(activeCookieJar?.id ?? null);
  const deleteCookieJar = useDeleteCookieJar(activeCookieJar ?? null);

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
          ...((cookieJars.length > 0 && activeCookieJar != null
            ? [
                { type: 'separator', label: activeCookieJar.name },
                {
                  key: 'manage',
                  label: 'Manage Cookies',
                  leftSlot: <Icon icon="cookie" />,
                  onSelect: () => {
                    if (activeCookieJar == null) return;
                    console.log(activeCookieJar.cookies[0]);
                    dialog.show({
                      id: 'cookies',
                      title: 'Manage Cookies',
                      size: 'full',
                      render: () => <CookieDialog cookieJarId={activeCookieJar.id} />,
                    });
                  },
                },
                {
                  key: 'rename',
                  label: 'Rename',
                  leftSlot: <Icon icon="pencil" />,
                  onSelect: async () => {
                    const name = await prompt({
                      title: 'Rename Cookie Jar',
                      description: (
                        <>
                          Enter a new name for <InlineCode>{activeCookieJar?.name}</InlineCode>
                        </>
                      ),
                      name: 'name',
                      label: 'Name',
                      defaultValue: activeCookieJar?.name,
                    });
                    updateCookieJar.mutate({ name });
                  },
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  leftSlot: <Icon icon="trash" />,
                  variant: 'danger',
                  onSelect: () => deleteCookieJar.mutateAsync(),
                },
              ]
            : []) as DropdownItem[]),
          { type: 'separator' },
          {
            key: 'create-cookie-jar',
            label: 'New Cookie Jar',
            leftSlot: <Icon icon="plus" />,
            onSelect: () => createCookieJar.mutate(),
          },
        ]}
      >
        <IconButton size="sm" icon="cookie" title="Cookie Jar" />
      </Dropdown>
    </HStack>
  );
});
