import * as D from '@radix-ui/react-dialog';
import classnames from 'classnames';
import React from 'react';
import { IconButton } from './IconButton';
import { HStack, VStack } from './Stacks';

interface Props {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
}

export function Dialog({ children, open, onOpenChange, title, description }: Props) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal container={document.querySelector<HTMLElement>('#radix-portal')}>
        <D.Overlay className="fixed inset-0 bg-gray-900 dark:bg-background opacity-80" />
        <D.Content
          className={classnames(
            'fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-gray-50 w-[20rem] max-h-[20rem]',
            'p-5 rounded-lg',
          )}
        >
          <D.Close asChild className="ml-auto absolute right-1 top-1">
            <IconButton aria-label="Close" icon="x" size="sm" />
          </D.Close>
          <VStack space={3}>
            <HStack items="center" className="pb-3">
              <D.Title className="text-xl font-semibold">{title}</D.Title>
            </HStack>
            {description && <D.Description>{description}</D.Description>}
            <div>{children}</div>
          </VStack>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
