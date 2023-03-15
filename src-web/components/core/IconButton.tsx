import classnames from 'classnames';
import { forwardRef } from 'react';
import type { ButtonProps } from './Button';
import { Button } from './Button';
import type { IconProps } from './Icon';
import { Icon } from './Icon';

type Props = IconProps &
  ButtonProps & { iconClassName?: string; iconSize?: IconProps['size']; title: string };

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { icon, spin, className, iconClassName, size = 'md', iconSize, ...props }: Props,
  ref,
) {
  return (
    <Button
      ref={ref}
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
        icon={icon}
        spin={spin}
        className={classnames(iconClassName, props.disabled && 'opacity-70')}
      />
    </Button>
  );
});
