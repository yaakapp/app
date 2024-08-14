import { useMutation } from '@tanstack/react-query';
import type { Folder } from '@yaakapp/api';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import { getFolder } from '../lib/store';
import { invokeCmd } from '../lib/tauri';
import { useConfirm } from './useConfirm';

export function useDeleteFolder(id: string | null) {
  const confirm = useConfirm();

  return useMutation<Folder | null, string>({
    mutationKey: ['delete_folder', id],
    mutationFn: async () => {
      const folder = await getFolder(id);
      const confirmed = await confirm({
        id: 'delete-folder',
        title: 'Delete Folder',
        variant: 'delete',
        description: (
          <>
            Permanently delete <InlineCode>{folder?.name}</InlineCode> and everything in it?
          </>
        ),
      });
      if (!confirmed) return null;
      return invokeCmd('cmd_delete_folder', { folderId: id });
    },
    onSettled: () => trackEvent('folder', 'delete'),
  });
}
