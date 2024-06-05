import { useCallback } from 'react';
import type { DialogProps } from '../components/core/Dialog';
import { useDialog } from '../components/DialogContext';
import type { AlertProps } from './Alert';
import { Alert } from './Alert';

export function useAlert() {
  const dialog = useDialog();
  return useCallback(
    ({
      id,
      title,
      body,
      size = 'sm',
    }: {
      id: string;
      title: DialogProps['title'];
      body: AlertProps['body'];
      size?: DialogProps['size'];
    }) =>
      dialog.show({
        id,
        title,
        hideX: true,
        size,
        render: ({ hide }) => Alert({ onHide: hide, body }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
}
