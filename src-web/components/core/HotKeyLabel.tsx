import classNames from 'classnames';
import type { HotkeyAction } from '../../hooks/useHotKey';
import { useHotKeyLabel } from '../../hooks/useHotKey';

interface Props {
  action: HotkeyAction;
  className?: string;
}

export function HotKeyLabel({ action, className }: Props) {
  const label = useHotKeyLabel(action);
  return <span className={classNames(className, 'text-fg-subtle whitespace-nowrap')}>{label}</span>;
}
