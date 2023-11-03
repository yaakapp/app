import {
  ArchiveIcon,
  CameraIcon,
  CheckboxIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CodeIcon,
  ColorWheelIcon,
  CopyIcon,
  Cross2Icon,
  DividerHorizontalIcon,
  DotsHorizontalIcon,
  DotsVerticalIcon,
  DragHandleDots2Icon,
  EyeClosedIcon,
  EyeOpenIcon,
  GearIcon,
  HamburgerMenuIcon,
  HomeIcon,
  ListBulletIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  OpenInNewWindowIcon,
  PaperPlaneIcon,
  Pencil2Icon,
  PlusCircledIcon,
  PlusIcon,
  QuestionMarkIcon,
  RowsIcon,
  SunIcon,
  TrashIcon,
  TriangleDownIcon,
  TriangleLeftIcon,
  TriangleRightIcon,
  DownloadIcon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { memo } from 'react';
import { ReactComponent as LeftPanelHiddenIcon } from '../../assets/icons/LeftPanelHiddenIcon.svg';
import { ReactComponent as LeftPanelVisibleIcon } from '../../assets/icons/LeftPanelVisibleIcon.svg';

const icons = {
  archive: ArchiveIcon,
  camera: CameraIcon,
  check: CheckIcon,
  checkbox: CheckboxIcon,
  clock: ClockIcon,
  chevronDown: ChevronDownIcon,
  code: CodeIcon,
  colorWheel: ColorWheelIcon,
  copy: CopyIcon,
  dividerH: DividerHorizontalIcon,
  dotsH: DotsHorizontalIcon,
  dotsV: DotsVerticalIcon,
  download: DownloadIcon,
  drag: DragHandleDots2Icon,
  eye: EyeOpenIcon,
  eyeClosed: EyeClosedIcon,
  gear: GearIcon,
  hamburger: HamburgerMenuIcon,
  home: HomeIcon,
  leftPanelHidden: LeftPanelHiddenIcon,
  leftPanelVisible: LeftPanelVisibleIcon,
  listBullet: ListBulletIcon,
  magicWand: MagicWandIcon,
  magnifyingGlass: MagnifyingGlassIcon,
  moon: MoonIcon,
  openNewWindow: OpenInNewWindowIcon,
  paperPlane: PaperPlaneIcon,
  pencil: Pencil2Icon,
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
  empty: (props: HTMLAttributes<HTMLSpanElement>) => <span {...props} />,
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
      className={classNames(
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
