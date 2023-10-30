import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Portal } from './Portal';

interface Props {
  children: ReactNode;
  portalName: string;
  open: boolean;
  onClose?: () => void;
  zIndex?: keyof typeof zIndexes;
  variant?: 'default' | 'transparent';
}

const zIndexes: Record<number, string> = {
  10: 'z-10',
  20: 'z-20',
  30: 'z-30',
  40: 'z-40',
  50: 'z-50',
};

export function Overlay({
  variant = 'default',
  zIndex = 30,
  open,
  onClose,
  portalName,
  children,
}: Props) {
  return (
    <Portal name={portalName}>
      {open && (
        <FocusTrap>
          <motion.div
            className={classNames('fixed inset-0', zIndexes[zIndex])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              aria-hidden
              onClick={onClose}
              className={classNames(
                'absolute inset-0',
                variant === 'default' && 'bg-gray-600/30 dark:bg-black/30 backdrop-blur-sm',
              )}
            />
            {/* Add region to still be able to drag the window */}
            {variant !== 'transparent' && (
              <div data-tauri-drag-region className="absolute top-0 left-0 right-0 h-md" />
            )}
            <div className="bg-red-100">{children}</div>
          </motion.div>
        </FocusTrap>
      )}
    </Portal>
  );
}
