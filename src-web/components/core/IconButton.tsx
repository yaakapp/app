import classNames from 'classnames';
import type { MouseEvent } from 'react';
import { forwardRef, useCallback } from 'react';
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
    tabIndex,
    size = 'md',
    iconSize,
    ...props
  }: Props,
  ref,
) {
  const [confirmed, setConfirmed] = useTimedBoolean();
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (showConfirm) setConfirmed();
      onClick?.(e);
    },
    [onClick, setConfirmed, showConfirm],
  );
  return (
    <Button
      ref={ref}
      aria-hidden={icon === 'empty'}
      disabled={icon === 'empty'}
      tabIndex={tabIndex ?? icon === 'empty' ? -1 : undefined}
      onClick={handleClick}
      className={classNames(
        className,
        'flex-shrink-0 text-gray-700 hover:text-gray-1000',
        '!px-0',
        size === 'md' && 'w-9',
        size === 'sm' && 'w-8',
        size === 'xs' && 'w-6',
      )}
      size={size}
      {...props}
    >
      <Icon
        size={iconSize}
        icon={confirmed ? 'check' : icon}
        spin={spin}
        className={classNames(
          iconClassName,
          props.disabled && 'opacity-70',
          confirmed && 'text-green-600',
        )}
      />
    </Button>
  );
});
