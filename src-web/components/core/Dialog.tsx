import * as D from '@radix-ui/react-dialog';
import classnames from 'classnames';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
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
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal container={document.querySelector<HTMLElement>('#radix-portal')}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <D.Overlay className="fixed inset-0 bg-gray-600/60 dark:bg-black/50" />
          <D.Content>
            <div
              className={classnames(
                className,
                'absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-gray-100',
                'w-[20rem] max-h-[80vh] p-5 rounded-lg overflow-auto',
                'dark:border border-gray-200 shadow-md shadow-black/10',
                wide && 'w-[80vw] max-w-[50rem]',
              )}
            >
              <D.Close asChild className="ml-auto absolute right-1 top-1">
                <IconButton title="Close dialog" aria-label="Close" icon="x" size="sm" />
              </D.Close>
              <VStack space={3}>
                <HStack alignItems="center" className="pb-3">
                  <D.Title className="text-xl font-semibold">{title}</D.Title>
                </HStack>
                {description && <D.Description>{description}</D.Description>}
                <div>{children}</div>
              </VStack>
            </div>
          </D.Content>
        </motion.div>
      </D.Portal>
    </D.Root>
  );
}
