import classNames from 'classnames';
import type { HotkeyAction } from '../../hooks/useHotkey';
import { useFormattedHotkey } from '../../hooks/useHotkey';
import { useOsInfo } from '../../hooks/useOsInfo';

interface Props {
  action: HotkeyAction | null;
}

export function HotKey({ action }: Props) {
  const osinfo = useOsInfo();
  const label = useFormattedHotkey(action);
  if (label === null || osinfo == null) {
    return null;
  }

  return (
    <span className={classNames('text-sm text-gray-1000 text-opacity-disabled')}>{label}</span>
  );
}
