import classnames from 'classnames';
import { forwardRef } from 'react';
import { useTimedBoolean } from '../../hooks/useTimedBoolean';
import type { ButtonProps } from './Button';
import { Button } from './Button';
import type { IconProps } from './Icon';
import { Icon } from './Icon';

type Props = IconProps &
  ButtonProps & {
    showConfirm?: boolean;
    iconClassName?: string;
    iconSize?: IconProps['size'];
    title: string;
  };

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  {
    showConfirm,
    icon,
    spin,
    onClick,
    className,
    iconClassName,
    size = 'md',
    iconSize,
    ...props
  }: Props,
  ref,
) {
  const [confirmed, setConfirmed] = useTimedBoolean();
  return (
    <Button
      ref={ref}
      onClick={(e) => {
        if (showConfirm) setConfirmed();
        onClick?.(e);
      }}
      className={classnames(
        className,
        'text-gray-700 hover:text-gray-1000',
        '!px-0',
        size === 'md' && 'w-9',
        size === 'sm' && 'w-8',
      )}
      size={size}
      {...props}
    >
      <Icon
        size={iconSize}
        icon={confirmed ? 'check' : icon}
        spin={spin}
        className={classnames(
          iconClassName,
          props.disabled && 'opacity-70',
          confirmed && 'text-green-600',
        )}
      />
    </Button>
  );
});
