import React from 'react';
import type { HotkeyAction } from '../../hooks/useHotkey';
import { HotKey } from './HotKey';

interface Props {
  hotkeys: { action: HotkeyAction; label: string }[];
}

export const HotKeyList = ({ hotkeys }: Props) => {
  return (
    <div className="mx-auto h-full flex items-center text-gray-800 text-sm">
      <div className="flex flex-col gap-1">
        {hotkeys.map((hotkey) => (
          <div key={hotkey.action} className="grid grid-cols-2">
            <p>{hotkey.label}</p>
            <div className="ml-auto">
              <HotKey action={hotkey.action} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
