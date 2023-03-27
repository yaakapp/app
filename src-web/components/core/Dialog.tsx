import classnames from 'classnames';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Overlay } from '../Overlay';
import { IconButton } from './IconButton';
import { HStack, VStack } from './Stacks';

export interface DialogProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  wide?: boolean;
  hideX?: boolean;
}

export function Dialog({
  children,
  className,
  wide,
  open,
  onClose,
  title,
  description,
  hideX,
}: DialogProps) {
  const titleId = useMemo(() => Math.random().toString(36).slice(2), []);
  const descriptionId = useMemo(
    () => (description ? Math.random().toString(36).slice(2) : undefined),
    [description],
  );

  return (
    <Overlay open={open} onClose={onClose} portalName="dialog">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="pointer-events-auto"
        >
          <motion.div
            initial={{ top: 5, scale: 0.97 }}
            animate={{ top: 0, scale: 1 }}
            className={classnames(
              className,
              'relative bg-gray-50 pointer-events-auto',
              'w-[20rem] max-h-[80vh] p-5 rounded-lg overflow-auto',
              'dark:border border-gray-200 shadow-md shadow-black/10',
              wide && 'w-[80vw] max-w-[50rem]',
            )}
          >
            {!hideX && (
              <IconButton
                onClick={onClose}
                title="Close dialog"
                aria-label="Close"
                icon="x"
                size="sm"
                className="ml-auto absolute right-1 top-1"
              />
            )}
            <VStack space={3}>
              <h1 className="text-xl font-semibold w-full" id={titleId}>
                {title}
              </h1>
              {description && <p id={descriptionId}>{description}</p>}
              <div>{children}</div>
            </VStack>
          </motion.div>
        </div>
      </div>
    </Overlay>
  );
}
