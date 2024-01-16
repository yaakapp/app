import * as lucide from 'lucide-react';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { memo } from 'react';
import { ReactComponent as LeftPanelHiddenIcon } from '../../assets/icons/LeftPanelHiddenIcon.svg';
import { ReactComponent as LeftPanelVisibleIcon } from '../../assets/icons/LeftPanelVisibleIcon.svg';

const icons = {
  archive: lucide.ArchiveIcon,
  box: lucide.BoxIcon,
  chat: lucide.MessageSquare,
  check: lucide.CheckIcon,
  chevronDown: lucide.ChevronDownIcon,
  chevronRight: lucide.ChevronRightIcon,
  code: lucide.CodeIcon,
  copy: lucide.CopyIcon,
  moreVertical: lucide.MoreVerticalIcon,
  download: lucide.DownloadIcon,
  gripVertical: lucide.GripVerticalIcon,
  eye: lucide.EyeIcon,
  eyeClosed: lucide.EyeOffIcon,
  filter: lucide.FilterIcon,
  flask: lucide.FlaskConicalIcon,
  keyboard: lucide.KeyboardIcon,
  magicWand: lucide.Wand2Icon,
  externalLink: lucide.ExternalLinkIcon,
  sendHorizontal: lucide.SendHorizonalIcon,
  pencil: lucide.PencilIcon,
  question: lucide.ShieldQuestionIcon,
  plus: lucide.PlusIcon,
  plusCircle: lucide.PlusCircleIcon,
  settings: lucide.SettingsIcon,
  settings2: lucide.Settings2Icon,
  trash: lucide.TrashIcon,
  update: lucide.RefreshCcwIcon,
  upload: lucide.UploadIcon,
  x: lucide.XIcon,

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
