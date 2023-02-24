import {
  ArchiveIcon,
  CameraIcon,
  GearIcon,
  HomeIcon,
  MoonIcon,
  PaperPlaneIcon,
  SunIcon,
  TriangleDownIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import classnames from 'classnames';
import { NamedExoticComponent } from 'react';

type IconName =
  | 'archive'
  | 'home'
  | 'camera'
  | 'gear'
  | 'triangle-down'
  | 'paper-plane'
  | 'update'
  | 'sun'
  | 'moon';

const icons: Record<IconName, NamedExoticComponent<{ className: string }>> = {
  'paper-plane': PaperPlaneIcon,
  'triangle-down': TriangleDownIcon,
  archive: ArchiveIcon,
  camera: CameraIcon,
  gear: GearIcon,
  home: HomeIcon,
  update: UpdateIcon,
  sun: SunIcon,
  moon: MoonIcon,
};

export interface IconProps {
  icon: IconName;
  className?: string;
  size?: 'md';
  spin?: boolean;
}

export function Icon({ icon, spin, size = 'md', className }: IconProps) {
  const Component = icons[icon];
  return (
    <Component
      className={classnames(
        className,
        'text-gray-800',
        size === 'md' && 'h-4 w-4',
        spin && 'animate-spin',
      )}
    />
  );
}
