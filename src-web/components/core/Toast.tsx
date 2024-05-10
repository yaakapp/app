import classNames from 'classnames';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import { useKey } from 'react-use';
import { Heading } from './Heading';
import { IconButton } from './IconButton';

export interface ToastProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  className?: string;
  timeout: number;
}

export function Toast({ children, className, open, onClose, title, timeout }: ToastProps) {
  const titleId = useMemo(() => Math.random().toString(36).slice(2), []);

  useKey(
    'Escape',
    () => {
      if (!open) return;
      onClose();
    },
    {},
    [open],
  );

  return (
    <motion.div
      initial={{ opacity: 0, right: '-10%' }}
      animate={{ opacity: 100, right: 0 }}
      exit={{ opacity: 0, right: '-100%' }}
      transition={{ duration: 0.2 }}
      className={classNames(
        className,
        'pointer-events-auto',
        'relative bg-gray-50 dark:bg-gray-100 pointer-events-auto',
        'rounded-lg',
        'border border-highlightSecondary dark:border-highlight shadow-xl',
        'max-w-[calc(100vw-5rem)] max-h-[calc(100vh-6rem)]',
        'w-[22rem] max-h-[80vh]',
        'm-2 grid grid-cols-[1fr_auto]',
        'text-gray-700',
      )}
    >
      <div className="px-3 py-2">
        {title && (
          <Heading size={3} id={titleId}>
            {title}
          </Heading>
        )}

        <div className="flex items-center gap-2">{children}</div>
      </div>

      <IconButton
        color="custom"
        className="opacity-50"
        title="Dismiss"
        icon="x"
        onClick={onClose}
      />
      <div className="w-full absolute bottom-0 left-0 right-0">
        <motion.div
          className="bg-highlight h-0.5"
          initial={{ width: '100%' }}
          animate={{ width: '0%', opacity: 0.2 }}
          transition={{ duration: timeout / 1000, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}
