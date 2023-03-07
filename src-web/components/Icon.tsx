import {
  ArchiveIcon,
  CameraIcon,
  CheckIcon,
  ClockIcon,
  CodeIcon,
  Cross2Icon,
  EyeOpenIcon,
  GearIcon,
  HomeIcon,
  MoonIcon,
  PaperPlaneIcon,
  PlusCircledIcon,
  PlusIcon,
  QuestionMarkIcon,
  SunIcon,
  TrashIcon,
  TriangleDownIcon,
  TriangleLeftIcon,
  TriangleRightIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import classnames from 'classnames';
import type { NamedExoticComponent } from 'react';

type IconName =
  | 'archive'
  | 'home'
  | 'camera'
  | 'gear'
  | 'eye'
  | 'triangleDown'
  | 'triangleLeft'
  | 'triangleRight'
  | 'paperPlane'
  | 'update'
  | 'question'
  | 'check'
  | 'plus'
  | 'plusCircle'
  | 'clock'
  | 'sun'
  | 'code'
  | 'x'
  | 'trash'
  | 'moon';

const icons: Record<IconName, NamedExoticComponent<{ className: string }>> = {
  paperPlane: PaperPlaneIcon,
  triangleDown: TriangleDownIcon,
  plus: PlusIcon,
  plusCircle: PlusCircledIcon,
  clock: ClockIcon,
  archive: ArchiveIcon,
  camera: CameraIcon,
  check: CheckIcon,
  triangleLeft: TriangleLeftIcon,
  triangleRight: TriangleRightIcon,
  gear: GearIcon,
  home: HomeIcon,
  update: UpdateIcon,
  sun: SunIcon,
  moon: MoonIcon,
  x: Cross2Icon,
  question: QuestionMarkIcon,
  eye: EyeOpenIcon,
  code: CodeIcon,
  trash: TrashIcon,
};

export interface IconProps {
  icon: IconName;
  className?: string;
  size?: 'md';
  spin?: boolean;
}

export function Icon({ icon, spin, size = 'md', className }: IconProps) {
  const Component = icons[icon] ?? icons.question;
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
