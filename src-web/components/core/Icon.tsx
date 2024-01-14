import * as I from '@radix-ui/react-icons';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { memo } from 'react';
import { ReactComponent as LeftPanelHiddenIcon } from '../../assets/icons/LeftPanelHiddenIcon.svg';
import { ReactComponent as LeftPanelVisibleIcon } from '../../assets/icons/LeftPanelVisibleIcon.svg';

const icons = {
  square: I.SquareIcon,
  minus: I.MinusIcon,
  hamburger: I.HamburgerMenuIcon,
  archive: I.ArchiveIcon,
  chat: I.ChatBubbleIcon,
  check: I.CheckIcon,
  checkbox: I.CheckboxIcon,
  clock: I.ClockIcon,
  chevronDown: I.ChevronDownIcon,
  chevronRight: I.ChevronRightIcon,
  code: I.CodeIcon,
  colorWheel: I.ColorWheelIcon,
  copy: I.CopyIcon,
  dividerH: I.DividerHorizontalIcon,
  dotsH: I.DotsHorizontalIcon,
  dotsV: I.DotsVerticalIcon,
  download: I.DownloadIcon,
  drag: I.DragHandleDots2Icon,
  eye: I.EyeOpenIcon,
  eyeClosed: I.EyeClosedIcon,
  gear: I.GearIcon,
  hamburger: I.HamburgerMenuIcon,
  home: I.HomeIcon,
  keyboard: I.KeyboardIcon,
  listBullet: I.ListBulletIcon,
  magicWand: I.MagicWandIcon,
  magnifyingGlass: I.MagnifyingGlassIcon,
  moon: I.MoonIcon,
  openNewWindow: I.OpenInNewWindowIcon,
  paperPlane: I.PaperPlaneIcon,
  pencil: I.Pencil2Icon,
  plus: I.PlusIcon,
  plusCircle: I.PlusCircledIcon,
  question: I.QuestionMarkIcon,
  rocket: I.RocketIcon,
  rows: I.RowsIcon,
  sun: I.SunIcon,
  trash: I.TrashIcon,
  triangleDown: I.TriangleDownIcon,
  triangleLeft: I.TriangleLeftIcon,
  triangleRight: I.TriangleRightIcon,
  update: I.UpdateIcon,
  upload: I.UploadIcon,
  x: I.Cross2Icon,

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
