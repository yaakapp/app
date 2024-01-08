import React from 'react';
import type { HotkeyAction } from '../../hooks/useHotkey';
import { HotKey } from './HotKey';
import { HotKeyLabel } from './HotKeyLabel';

interface Props {
  hotkeys: HotkeyAction[];
}

export const HotKeyList = ({ hotkeys }: Props) => {
  return (
    <div className="mx-auto h-full flex items-center text-gray-700 text-sm">
      <div className="flex flex-col gap-1">
        {hotkeys.map((hotkey) => (
          <div key={hotkey} className="grid grid-cols-2">
            <HotKeyLabel action={hotkey} />
            <HotKey className="ml-auto" action={hotkey} />
          </div>
        ))}
      </div>
    </div>
  );
};
