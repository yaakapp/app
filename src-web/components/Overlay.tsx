import classnames from 'classnames';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Portal } from './Portal';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  portalName: string;
  open: boolean;
  zIndex?: keyof typeof zIndexes;
}

const zIndexes: Record<number, string> = {
  10: 'z-10',
  20: 'z-20',
  30: 'z-30',
  40: 'z-40',
  50: 'z-50',
};

export function Overlay({ zIndex = 30, open, children, onClick, portalName }: Props) {
  return (
    <Portal name={portalName}>
      {open && (
        <motion.div
          className={classnames('fixed inset-0', zIndexes[zIndex])}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            aria-hidden
            onClick={onClick}
            className="absolute inset-0 bg-gray-600/60 dark:bg-black/50"
          />
          {children}
        </motion.div>
      )}
    </Portal>
  );
}
