import classnames from 'classnames';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Portal } from '../Portal';
import { IconButton } from './IconButton';
import { HStack, VStack } from './Stacks';

interface Props {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  className?: string;
  wide?: boolean;
}

export function Dialog({
  children,
  className,
  wide,
  open,
  onOpenChange,
  title,
  description,
}: Props) {
  return (
    <Portal name="dialog">
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            aria-hidden
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-gray-600/60 dark:bg-black/50"
          />
          <div>
            <div
              className={classnames(
                className,
                'absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-gray-100',
                'w-[20rem] max-h-[80vh] p-5 rounded-lg overflow-auto',
                'dark:border border-gray-200 shadow-md shadow-black/10',
                wide && 'w-[80vw] max-w-[50rem]',
              )}
            >
              <IconButton
                onClick={() => onOpenChange(false)}
                title="Close dialog"
                aria-label="Close"
                icon="x"
                size="sm"
                className="ml-auto absolute right-1 top-1"
              />
              <VStack space={3}>
                <HStack alignItems="center" className="pb-3">
                  <div className="text-xl font-semibold">{title}</div>
                </HStack>
                {description && <div>{description}</div>}
                <div>{children}</div>
              </VStack>
            </div>
          </div>
        </motion.div>
      )}
    </Portal>
  );
}
