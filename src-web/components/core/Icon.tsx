import {
  ArchiveIcon,
  CameraIcon,
  CheckboxIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CodeIcon,
  ColorWheelIcon,
  Cross2Icon,
  DividerHorizontalIcon,
  DotsHorizontalIcon,
  DotsVerticalIcon,
  DragHandleDots2Icon,
  EyeOpenIcon,
  GearIcon,
  HomeIcon,
  ListBulletIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PaperPlaneIcon,
  PlusCircledIcon,
  PlusIcon,
  QuestionMarkIcon,
  RowsIcon,
  SunIcon,
  TrashIcon,
  TriangleDownIcon,
  TriangleLeftIcon,
  TriangleRightIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import classnames from 'classnames';
import { memo } from 'react';

const icons = {
  archive: ArchiveIcon,
  camera: CameraIcon,
  check: CheckIcon,
  checkbox: CheckboxIcon,
  clock: ClockIcon,
  code: CodeIcon,
  colorWheel: ColorWheelIcon,
  dotsH: DotsHorizontalIcon,
  dotsV: DotsVerticalIcon,
  drag: DragHandleDots2Icon,
  eye: EyeOpenIcon,
  gear: GearIcon,
  home: HomeIcon,
  listBullet: ListBulletIcon,
  magicWand: MagicWandIcon,
  chevronDown: ChevronDownIcon,
  magnifyingGlass: MagnifyingGlassIcon,
  moon: MoonIcon,
  paperPlane: PaperPlaneIcon,
  plus: PlusIcon,
  dividerH: DividerHorizontalIcon,
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
  empty: () => <span />,
};

export interface IconProps {
  icon: keyof typeof icons;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  spin?: boolean;
}

export const Icon = memo(function Icon({ icon, spin, size = 'md', className }: IconProps) {
  const Component = icons[icon] ?? icons.question;
  return (
    <Component
      className={classnames(
        className,
        'text-inherit',
        size === 'md' && 'h-4 w-4',
        size === 'sm' && 'h-3.5 w-3.5',
        size === 'xs' && 'h-3 w-3',
        spin && 'animate-spin',
      )}
    />
  );
});
