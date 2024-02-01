import { useCallback } from 'react';
import type { DialogProps } from '../components/core/Dialog';
import { useDialog } from '../components/DialogContext';
import type { AlertProps } from './Alert';
import { Alert } from './Alert';

export function useAlert() {
  const dialog = useDialog();
  return useCallback(
    ({ id, title, body }: { id: string; title: DialogProps['title']; body: AlertProps['body'] }) =>
      dialog.show({
        id,
        title,
        hideX: true,
        size: 'sm',
        render: ({ hide }) => Alert({ onHide: hide, body }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}
