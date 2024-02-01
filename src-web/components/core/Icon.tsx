import * as lucide from 'lucide-react';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { memo } from 'react';

const icons = {
  archive: lucide.ArchiveIcon,
  box: lucide.BoxIcon,
  cake: lucide.CakeIcon,
  chat: lucide.MessageSquare,
  check: lucide.CheckIcon,
  chevronDown: lucide.ChevronDownIcon,
  chevronRight: lucide.ChevronRightIcon,
  cookie: lucide.CookieIcon,
  code: lucide.CodeIcon,
  copy: lucide.CopyIcon,
  download: lucide.DownloadIcon,
  folderInput: lucide.FolderInputIcon,
  folderOutput: lucide.FolderOutputIcon,
  externalLink: lucide.ExternalLinkIcon,
  eye: lucide.EyeIcon,
  eyeClosed: lucide.EyeOffIcon,
  filter: lucide.FilterIcon,
  flask: lucide.FlaskConicalIcon,
  gripVertical: lucide.GripVerticalIcon,
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
  sendHorizontal: lucide.SendHorizonalIcon,
  settings2: lucide.Settings2Icon,
  settings: lucide.SettingsIcon,
  sparkles: lucide.SparklesIcon,
  trash: lucide.TrashIcon,
  update: lucide.RefreshCcwIcon,
  upload: lucide.UploadIcon,
  arrowUpFromDot: lucide.ArrowUpFromDotIcon,
  arrowDownToDot: lucide.ArrowDownToDotIcon,
  arrowUpDown: lucide.ArrowUpDownIcon,
  arrowDown: lucide.ArrowDownIcon,
  arrowUp: lucide.ArrowUpIcon,
  arrowBigDownDash: lucide.ArrowBigDownDashIcon,
  arrowBigUpDash: lucide.ArrowBigUpDashIcon,
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
