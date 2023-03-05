import {
  ArchiveIcon,
  CameraIcon,
  CheckIcon,
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
  | 'triangle-down'
  | 'paper-plane'
  | 'update'
  | 'question'
  | 'check'
  | 'plus'
  | 'plus-circled'
  | 'sun'
  | 'code'
  | 'x'
  | 'trash'
  | 'moon';

const icons: Record<IconName, NamedExoticComponent<{ className: string }>> = {
  'paper-plane': PaperPlaneIcon,
  'triangle-down': TriangleDownIcon,
  plus: PlusIcon,
  'plus-circled': PlusCircledIcon,
  archive: ArchiveIcon,
  camera: CameraIcon,
  check: CheckIcon,
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
