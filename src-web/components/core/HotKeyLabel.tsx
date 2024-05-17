import type { HotkeyAction } from '../../hooks/useHotKey';
import { useHotKeyLabel } from '../../hooks/useHotKey';

interface Props {
  action: HotkeyAction;
}

export function HotKeyLabel({ action }: Props) {
  const label = useHotKeyLabel(action);
  return <span className="text-fg-subtle">{label}</span>;
}
