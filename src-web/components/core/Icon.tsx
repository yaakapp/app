import * as ReactIcons from '@radix-ui/react-icons';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { memo } from 'react';
import { ReactComponent as LeftPanelHiddenIcon } from '../../assets/icons/LeftPanelHiddenIcon.svg';
import { ReactComponent as LeftPanelVisibleIcon } from '../../assets/icons/LeftPanelVisibleIcon.svg';

const icons = {
  archive: ReactIcons.ArchiveIcon,
  camera: ReactIcons.CameraIcon,
  check: ReactIcons.CheckIcon,
  checkbox: ReactIcons.CheckboxIcon,
  clock: ReactIcons.ClockIcon,
  chevronDown: ReactIcons.ChevronDownIcon,
  chevronRight: ReactIcons.ChevronRightIcon,
  code: ReactIcons.CodeIcon,
  colorWheel: ReactIcons.ColorWheelIcon,
  copy: ReactIcons.CopyIcon,
  dividerH: ReactIcons.DividerHorizontalIcon,
  dotsH: ReactIcons.DotsHorizontalIcon,
  dotsV: ReactIcons.DotsVerticalIcon,
  download: ReactIcons.DownloadIcon,
  drag: ReactIcons.DragHandleDots2Icon,
  eye: ReactIcons.EyeOpenIcon,
  eyeClosed: ReactIcons.EyeClosedIcon,
  gear: ReactIcons.GearIcon,
  hamburger: ReactIcons.HamburgerMenuIcon,
  home: ReactIcons.HomeIcon,
  listBullet: ReactIcons.ListBulletIcon,
  magicWand: ReactIcons.MagicWandIcon,
  magnifyingGlass: ReactIcons.MagnifyingGlassIcon,
  moon: ReactIcons.MoonIcon,
  openNewWindow: ReactIcons.OpenInNewWindowIcon,
  paperPlane: ReactIcons.PaperPlaneIcon,
  pencil: ReactIcons.Pencil2Icon,
  plus: ReactIcons.PlusIcon,
  plusCircle: ReactIcons.PlusCircledIcon,
  question: ReactIcons.QuestionMarkIcon,
  rows: ReactIcons.RowsIcon,
  sun: ReactIcons.SunIcon,
  trash: ReactIcons.TrashIcon,
  triangleDown: ReactIcons.TriangleDownIcon,
  triangleLeft: ReactIcons.TriangleLeftIcon,
  triangleRight: ReactIcons.TriangleRightIcon,
  update: ReactIcons.UpdateIcon,
  upload: ReactIcons.UploadIcon,
  x: ReactIcons.Cross2Icon,

  // Custom
  leftPanelHidden: LeftPanelHiddenIcon,
  leftPanelVisible: LeftPanelVisibleIcon,
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
