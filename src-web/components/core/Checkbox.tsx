import type { CheckedState } from '@radix-ui/react-checkbox';
import * as CB from '@radix-ui/react-checkbox';
import classnames from 'classnames';
import { Icon } from './Icon';

interface Props {
  checked: CheckedState;
  onChange: (checked: CheckedState) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, className, disabled }: Props) {
  return (
    <CB.Root
      disabled={disabled}
      checked={checked}
      onCheckedChange={onChange}
      className={classnames(
        className,
        'w-5 h-5 border border-gray-200 rounded',
        'focus:border-focus',
        'disabled:opacity-disabled',
        'outline-none',
        checked && 'bg-gray-200/10',
        // Remove focus style
      )}
    >
      <CB.Indicator className="flex items-center justify-center">
        {checked === 'indeterminate' && <Icon icon="dividerH" />}
        {checked === true && <Icon icon="check" />}
      </CB.Indicator>
    </CB.Root>
  );
}
