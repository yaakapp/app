import { ComponentType } from 'react';
import {
  ArchiveIcon,
  CameraIcon,
  ChevronDownIcon,
  GearIcon,
  HomeIcon,
  TriangleDownIcon,
} from '@radix-ui/react-icons';
import classnames from 'classnames';

type IconName = 'archive' | 'home' | 'camera' | 'gear' | 'triangle-down';

const icons: Record<IconName, ComponentType> = {
  archive: ArchiveIcon,
  home: HomeIcon,
  camera: CameraIcon,
  gear: GearIcon,
  'triangle-down': TriangleDownIcon,
};

export interface IconProps {
  icon: IconName;
  className?: string;
}

export function Icon({ icon, className }: IconProps) {
  const Component = icons[icon];
  return (
    <div className={classnames(className, 'flex items-center')}>
      <Component />
    </div>
  );
}
