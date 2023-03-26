import { useDialog } from '../components/DialogContext';
import { Confirm } from './Confirm';

export function useConfirm() {
  const dialog = useDialog();
  return ({ title, description }: { title: string; description?: string }) => {
    dialog.show({
      title,
      description,
      hideX: true,
      render: Confirm,
    });
  };
}
