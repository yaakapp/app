import classnames from 'classnames';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Overlay } from '../Overlay';
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
    <Overlay open={open} onClick={() => onOpenChange(false)} portalName="dialog">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <motion.div
            initial={{ top: 5, scale: 0.97 }}
            animate={{ top: 0, scale: 1 }}
            className={classnames(
              className,
              'relative bg-gray-100 pointer-events-auto',
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
          </motion.div>
        </div>
      </div>
    </Overlay>
  );
}
