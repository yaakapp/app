import { useState } from 'react';
import { useOpenWorkspace } from '../hooks/useOpenWorkspace';
import { useSettings } from '../hooks/useSettings';
import { useUpdateSettings } from '../hooks/useUpdateSettings';
import type { Workspace } from '../lib/models';
import { Button } from './core/Button';
import { Checkbox } from './core/Checkbox';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';
import { HStack, VStack } from './core/Stacks';

interface Props {
  hide: () => void;
  workspace: Workspace;
}

export function OpenWorkspaceDialog({ hide, workspace }: Props) {
  const openWorkspace = useOpenWorkspace();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const [remember, setRemember] = useState<boolean>(false);

  return (
    <VStack space={3}>
      <p>
        Where would you like to open <InlineCode>{workspace.name}</InlineCode>?
      </p>
      <HStack space={2} justifyContent="start" className="flex-row-reverse">
        <Button
          className="focus"
          color="primary"
          onClick={() => {
            hide();
            openWorkspace.mutate({ workspaceId: workspace.id, inNewWindow: false });
            if (remember) {
              updateSettings.mutate({ openWorkspaceNewWindow: false });
            }
          }}
        >
          This Window
        </Button>
        <Button
          className="focus"
          color="secondary"
          rightSlot={<Icon icon="externalLink" />}
          onClick={() => {
            hide();
            openWorkspace.mutate({ workspaceId: workspace.id, inNewWindow: true });
            if (remember) {
              updateSettings.mutate({ openWorkspaceNewWindow: true });
            }
          }}
        >
          New Window
        </Button>
      </HStack>
      {settings && (
        <HStack justifyContent="end">
          <Checkbox checked={remember} title="Remember my choice" onChange={setRemember} />
        </HStack>
      )}
    </VStack>
  );
}
