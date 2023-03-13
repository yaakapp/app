import * as T from '@radix-ui/react-tabs';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from './Button';
import { ScrollArea } from './ScrollArea';
import { HStack } from './Stacks';

import './Tabs.css';

interface Props {
  defaultValue?: string;
  label: string;
  tabs: { value: string; label: ReactNode }[];
  tabListClassName?: string;
  className?: string;
  children: ReactNode;
}

export function Tabs({ defaultValue, label, children, tabs, className, tabListClassName }: Props) {
  const [value, setValue] = useState(defaultValue);
  return (
    <T.Root
      defaultValue={defaultValue}
      onValueChange={setValue}
      className={classnames(
        className,
        // 'h-full overflow-hidden grid grid-rows-[auto_minmax(0,1fr)]',
        'h-full flex flex-col min-h-[min-content]',
      )}
    >
      <T.List
        aria-label={label}
        className={classnames(tabListClassName, 'h-auto flex items-center')}
      >
        <ScrollArea className="w-full pb-2">
          <HStack space={1}>
            {tabs.map((t) => (
              <TabTrigger key={t.value} value={t.value} active={t.value === value}>
                {t.label}
              </TabTrigger>
            ))}
          </HStack>
        </ScrollArea>
      </T.List>
      {children}
    </T.Root>
  );
}

interface TabTriggerProps {
  value: string;
  children: ReactNode;
  active?: boolean;
}

export function TabTrigger({ value, children, active }: TabTriggerProps) {
  return (
    <T.Trigger value={value} asChild>
      <Button
        color="custom"
        size="sm"
        className={classnames(
          active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900',
        )}
      >
        {children}
      </Button>
    </T.Trigger>
  );
}

interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({ value, children, className }: TabContentProps) {
  return (
    <T.Content
      forceMount
      value={value}
      className={classnames(className, 'tab-content', 'w-full overflow-auto flex-grow h-0')}
    >
      {children}
    </T.Content>
  );
}
