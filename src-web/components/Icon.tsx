import {
  ArchiveIcon,
  CameraIcon,
  CheckIcon,
  ClockIcon,
  CodeIcon,
  ColorWheelIcon,
  Cross2Icon,
  EyeOpenIcon,
  GearIcon,
  HomeIcon,
  MoonIcon,
  ListBulletIcon,
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
  RowsIcon,
} from '@radix-ui/react-icons';
import classnames from 'classnames';

const icons = {
  archive: ArchiveIcon,
  camera: CameraIcon,
  check: CheckIcon,
  clock: ClockIcon,
  code: CodeIcon,
  colorWheel: ColorWheelIcon,
  eye: EyeOpenIcon,
  gear: GearIcon,
  home: HomeIcon,
  listBullet: ListBulletIcon,
  moon: MoonIcon,
  paperPlane: PaperPlaneIcon,
  plus: PlusIcon,
  plusCircle: PlusCircledIcon,
  question: QuestionMarkIcon,
  rows: RowsIcon,
  sun: SunIcon,
  trash: TrashIcon,
  triangleDown: TriangleDownIcon,
  triangleLeft: TriangleLeftIcon,
  triangleRight: TriangleRightIcon,
  update: UpdateIcon,
  x: Cross2Icon,
};

export interface IconProps {
  icon: keyof typeof icons;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
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
        size === 'sm' && 'h-3 w-3',
        size === 'xs' && 'h-2 w-2',
        spin && 'animate-spin',
      )}
    />
  );
}
