import * as lucide from 'lucide-react';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { memo } from 'react';

const icons = {
  archive: lucide.ArchiveIcon,
  arrowBigDownDash: lucide.ArrowBigDownDashIcon,
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
  chevronDown: lucide.ChevronDownIcon,
  chevronRight: lucide.ChevronRightIcon,
  code: lucide.CodeIcon,
  cookie: lucide.CookieIcon,
  copy: lucide.CopyIcon,
  download: lucide.DownloadIcon,
  externalLink: lucide.ExternalLinkIcon,
  eye: lucide.EyeIcon,
  eyeClosed: lucide.EyeOffIcon,
  filter: lucide.FilterIcon,
  flask: lucide.FlaskConicalIcon,
  folderInput: lucide.FolderInputIcon,
  folderOutput: lucide.FolderOutputIcon,
  gripVertical: lucide.GripVerticalIcon,
  info: lucide.InfoIcon,
  keyboard: lucide.KeyboardIcon,
  leftPanelHidden: lucide.PanelLeftOpenIcon,
  leftPanelVisible: lucide.PanelLeftCloseIcon,
  magicWand: lucide.Wand2Icon,
  moreVertical: lucide.MoreVerticalIcon,
  pencil: lucide.PencilIcon,
  plug: lucide.Plug,
  plus: lucide.PlusIcon,
  plusCircle: lucide.PlusCircleIcon,
  question: lucide.ShieldQuestionIcon,
  refresh: lucide.RefreshCwIcon,
  search: lucide.SearchIcon,
  sendHorizontal: lucide.SendHorizonalIcon,
  settings2: lucide.Settings2Icon,
  settings: lucide.SettingsIcon,
  sparkles: lucide.SparklesIcon,
  trash: lucide.TrashIcon,
  update: lucide.RefreshCcwIcon,
  upload: lucide.UploadIcon,
  x: lucide.XIcon,

  empty: (props: HTMLAttributes<HTMLSpanElement>) => <span {...props} />,
};

export interface IconProps {
  icon: keyof typeof icons;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  spin?: boolean;
}

export const Icon = memo(function Icon({ icon, spin, size = 'md', className }: IconProps) {
  const Component = icons[icon] ?? icons.question;
  return (
    <Component
      className={classNames(
        className,
        'text-inherit flex-shrink-0',
        size === 'lg' && 'h-5 w-5',
        size === 'md' && 'h-4 w-4',
        size === 'sm' && 'h-3.5 w-3.5',
        size === 'xs' && 'h-3 w-3',
        spin && 'animate-spin',
      )}
    />
  );
});
