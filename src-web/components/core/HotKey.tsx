import classNames from 'classnames';
import type { HotkeyAction } from '../../hooks/useHotKey';
import { useFormattedHotkey } from '../../hooks/useHotKey';
import { useOsInfo } from '../../hooks/useOsInfo';
import { HStack } from './Stacks';

interface Props {
  action: HotkeyAction | null;
  className?: string;
  variant?: 'text' | 'with-bg';
}

export function HotKey({ action, className, variant }: Props) {
  const osInfo = useOsInfo();
  const label = useFormattedHotkey(action);
  if (label === null || osInfo == null) {
    return null;
  }

  return (
    <HStack
      className={classNames(
        className,
        variant === 'with-bg' && 'rounded border',
        'text-gray-1000 text-opacity-disabled',
      )}
    >
      {label.split('').map((char, index) => (
        <div key={index} className="w-[1.1em] text-center">
          {char}
        </div>
      ))}
    </HStack>
  );
}
