import classNames from 'classnames';
import { useCallback } from 'react';
import { Icon } from './Icon';

interface Props {
  checked: boolean;
  title: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onChange, className, disabled, title }: Props) {
  const handleClick = useCallback(() => {
    onChange(!checked);
  }, [onChange, checked]);

  return (
    <button
      role="checkbox"
      aria-checked={checked ? 'true' : 'false'}
      disabled={disabled}
      onClick={handleClick}
      title={title}
      className={classNames(
        className,
        'flex-shrink-0 w-4 h-4 border border-gray-200 rounded',
        'focus:border-focus',
        'disabled:opacity-disabled',
        checked && 'bg-gray-200/10',
        // Remove focus style
        'outline-none',
      )}
    >
      <div className="flex items-center justify-center">
        <Icon size="sm" icon={checked ? 'check' : 'empty'} />
      </div>
    </button>
  );
}
