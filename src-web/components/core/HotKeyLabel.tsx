import type { HotkeyAction } from '../../hooks/useHotkey';
import { useHotKeyLabel } from '../../hooks/useHotkey';

interface Props {
  action: HotkeyAction | null;
}

export function HotKeyLabel({ action }: Props) {
  const label = useHotKeyLabel(action);
  return <span>{label}</span>;
}
