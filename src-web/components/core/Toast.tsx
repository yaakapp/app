import classNames from 'classnames';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import React from 'react';
import { useKey } from 'react-use';
import type { IconProps } from './Icon';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { VStack } from './Stacks';

export interface ToastProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
  timeout: number | null;
  action?: ReactNode;
  variant?: 'custom' | 'copied' | 'success' | 'info' | 'warning' | 'error';
}

const ICONS: Record<NonNullable<ToastProps['variant']>, IconProps['icon'] | null> = {
  custom: null,
  copied: 'copyCheck',
  warning: 'alert',
  error: 'alert',
  info: 'info',
  success: 'checkCircle',
};

export function Toast({
  children,
  className,
  open,
  onClose,
  timeout,
  action,
  variant = 'info',
}: ToastProps) {
  useKey(
    'Escape',
    () => {
      if (!open) return;
      onClose();
    },
    {},
    [open],
  );

  const icon = variant in ICONS && ICONS[variant];

  return (
    <motion.div
      initial={{ opacity: 0, right: '-10%' }}
      animate={{ opacity: 100, right: 0 }}
      exit={{ opacity: 0, right: '-100%' }}
      transition={{ duration: 0.2 }}
      className={classNames(
        className,
        'x-theme-toast',
        'pointer-events-auto',
        'relative bg-surface pointer-events-auto',
        'rounded-lg',
        'border border-border-subtle shadow-lg',
        'max-w-[calc(100vw-5rem)] max-h-[calc(100vh-6rem)]',
        'w-[22rem] max-h-[80vh]',
        'm-2 grid grid-cols-[1fr_auto]',
        'text',
      )}
    >
      <div className="px-3 py-3 flex items-center gap-2">
        {icon && (
          <Icon
            icon={icon}
            className={classNames(
              variant === 'success' && 'text-success',
              variant === 'warning' && 'text-warning',
              variant === 'error' && 'text-danger',
              variant === 'copied' && 'text-primary',
            )}
          />
        )}
        <VStack space={2}>
          <div>{children}</div>
          {action}
        </VStack>
      </div>

      <IconButton
        color="custom"
        className="opacity-60"
        title="Dismiss"
        icon="x"
        onClick={onClose}
      />

      {timeout != null && (
        <div className="w-full absolute bottom-0 left-0 right-0">
          <motion.div
            className="bg-surface-highlight h-0.5"
            initial={{ width: '100%' }}
            animate={{ width: '0%', opacity: 0.2 }}
            transition={{ duration: timeout / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
}
