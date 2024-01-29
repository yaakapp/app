import type { DialogProps } from '../components/core/Dialog';
import { useDialog } from '../components/DialogContext';
import type { ConfirmProps } from './Confirm';
import { Confirm } from './Confirm';

export function useConfirm() {
  const dialog = useDialog();
  return ({
    id,
    title,
    description,
    variant,
  }: {
    id: string;
    title: DialogProps['title'];
    description?: DialogProps['description'];
    variant: ConfirmProps['variant'];
  }) =>
    new Promise((onResult: ConfirmProps['onResult']) => {
      dialog.show({
        id,
        title,
        description,
        hideX: true,
        size: 'sm',
        render: ({ hide }) => Confirm({ onHide: hide, variant, onResult }),
      });
    });
}
