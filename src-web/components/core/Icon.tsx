import classNames from 'classnames';
import * as lucide from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { memo } from 'react';

const icons = {
  alert: lucide.AlertTriangleIcon,
  archive: lucide.ArchiveIcon,
  arrowBigDownDash: lucide.ArrowBigDownDashIcon,
  arrowBigLeftDash: lucide.ArrowBigLeftDashIcon,
  arrowBigRightDash: lucide.ArrowBigRightDashIcon,
  arrowBigUpDash: lucide.ArrowBigUpDashIcon,
  arrowDown: lucide.ArrowDownIcon,
  arrowDownToDot: lucide.ArrowDownToDotIcon,
  arrowUp: lucide.ArrowUpIcon,
  arrowUpDown: lucide.ArrowUpDownIcon,
  arrowUpFromDot: lucide.ArrowUpFromDotIcon,
  box: lucide.BoxIcon,
  cake: lucide.CakeIcon,
  chat: lucide.MessageSquare,
  check: lucide.CheckIcon,
  checkCircle: lucide.CheckCircleIcon,
  chevronDown: lucide.ChevronDownIcon,
  chevronRight: lucide.ChevronRightIcon,
  code: lucide.CodeIcon,
  cookie: lucide.CookieIcon,
  copy: lucide.CopyIcon,
  copyCheck: lucide.CopyCheck,
  download: lucide.DownloadIcon,
  externalLink: lucide.ExternalLinkIcon,
  eye: lucide.EyeIcon,
  eyeClosed: lucide.EyeOffIcon,
  fileCode: lucide.FileCodeIcon,
  filter: lucide.FilterIcon,
  flask: lucide.FlaskConicalIcon,
  folderInput: lucide.FolderInputIcon,
  folderOutput: lucide.FolderOutputIcon,
  gripVertical: lucide.GripVerticalIcon,
  hand: lucide.HandIcon,
  house: lucide.HomeIcon,
  info: lucide.InfoIcon,
  keyboard: lucide.KeyboardIcon,
  leftPanelHidden: lucide.PanelLeftOpenIcon,
  leftPanelVisible: lucide.PanelLeftCloseIcon,
  magicWand: lucide.Wand2Icon,
  minus: lucide.MinusIcon,
  moon: lucide.MoonIcon,
  moreVertical: lucide.MoreVerticalIcon,
  paste: lucide.ClipboardPasteIcon,
  pencil: lucide.PencilIcon,
  pin: lucide.PinIcon,
  plug: lucide.Plug,
  plus: lucide.PlusIcon,
  plusCircle: lucide.PlusCircleIcon,
  question: lucide.ShieldQuestionIcon,
  refresh: lucide.RefreshCwIcon,
  save: lucide.SaveIcon,
  search: lucide.SearchIcon,
  sendHorizontal: lucide.SendHorizonalIcon,
  settings2: lucide.Settings2Icon,
  settings: lucide.SettingsIcon,
  sparkles: lucide.SparklesIcon,
  sun: lucide.SunIcon,
  table: lucide.TableIcon,
  text: lucide.FileTextIcon,
  trash: lucide.Trash2Icon,
  unpin: lucide.PinOffIcon,
  update: lucide.RefreshCcwIcon,
  upload: lucide.UploadIcon,
  x: lucide.XIcon,

  empty: (props: HTMLAttributes<HTMLSpanElement>) => <span {...props} />,
};

export interface IconProps {
  icon: keyof typeof icons;
  className?: string;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg';
  spin?: boolean;
  title?: string;
}

export const Icon = memo(function Icon({ icon, spin, size = 'md', className, title }: IconProps) {
  const Component = icons[icon] ?? icons.question;
  return (
    <Component
      title={title}
      className={classNames(
        className,
        'text-inherit flex-shrink-0',
        size === 'lg' && 'h-5 w-5',
        size === 'md' && 'h-4 w-4',
        size === 'sm' && 'h-3.5 w-3.5',
        size === 'xs' && 'h-3 w-3',
        size === '2xs' && 'h-2.5 w-2.5',
        spin && 'animate-spin',
      )}
    />
  );
});
