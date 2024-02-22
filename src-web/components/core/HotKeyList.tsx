import React from 'react';
import type { HotkeyAction } from '../../hooks/useHotKey';
import { HotKey } from './HotKey';
import { HotKeyLabel } from './HotKeyLabel';
import { HStack, VStack } from './Stacks';

interface Props {
  hotkeys: HotkeyAction[];
  bottomSlot?: React.ReactNode;
}

export const HotKeyList = ({ hotkeys, bottomSlot }: Props) => {
  return (
    <div className="mx-auto h-full flex items-center text-gray-700 text-sm">
      <VStack space={2}>
        {hotkeys.map((hotkey) => (
          <HStack key={hotkey} className="grid grid-cols-2">
            <HotKeyLabel action={hotkey} />
            <HotKey className="ml-auto" action={hotkey} />
          </HStack>
        ))}
        {bottomSlot}
      </VStack>
    </div>
  );
};
