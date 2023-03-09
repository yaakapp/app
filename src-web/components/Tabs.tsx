import * as T from '@radix-ui/react-tabs';
import classnames from 'classnames';
import type { ComponentChildren } from 'preact';
import { useState } from 'react';
import { Button } from './Button';
import { ScrollArea } from './ScrollArea';
import { HStack } from './Stacks';

interface Props {
  defaultValue?: string;
  label: string;
  tabs: { value: string; label: ComponentChildren }[];
  tabListClassName?: string;
  className?: string;
  children: ComponentChildren;
}

export function Tabs({ defaultValue, label, children, tabs, className, tabListClassName }: Props) {
  const [value, setValue] = useState(defaultValue);
  return (
    <T.Root
      defaultValue={defaultValue}
      onValueChange={setValue}
      className={classnames(className, 'h-full overflow-hidden')}
    >
      <T.List aria-label={label} className={classnames(tabListClassName, 'flex items-center')}>
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
  children: ComponentChildren;
  active?: boolean;
}

export function TabTrigger({ value, children, active }: TabTriggerProps) {
  return (
    <T.Trigger value={value} asChild>
      <Button
        size="sm"
        disabled={active}
        className={classnames(active ? 'bg-gray-100' : '!text-gray-500 hover:!text-gray-800')}
      >
        {children}
      </Button>
    </T.Trigger>
  );
}

interface TabContentProps {
  value: string;
  children: ComponentChildren;
  className?: string;
}

export function TabContent({ value, children, className }: TabContentProps) {
  return (
    <T.Content value={value} className={classnames(className, 'w-full h-full')}>
      {children}
    </T.Content>
  );
}
