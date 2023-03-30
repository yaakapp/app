import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { IconButton } from './core/IconButton';

export function ToggleThemeButton() {
  const { appearance, toggleAppearance } = useTheme();
  return (
    <IconButton
      title={appearance === 'dark' ? 'Enable light mode' : 'Enable dark mode'}
      icon={appearance === 'dark' ? 'moon' : 'sun'}
      onClick={toggleAppearance}
    />
  );
}
