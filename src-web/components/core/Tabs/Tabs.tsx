import * as T from '@radix-ui/react-tabs';
import classnames from 'classnames';
import { memo } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../Button';
import type { DropdownMenuRadioItem, DropdownMenuRadioProps } from '../Dropdown';
import { DropdownMenuRadio, DropdownMenuTrigger } from '../Dropdown';
import { Icon } from '../Icon';
import { ScrollArea } from '../ScrollArea';
import { HStack } from '../Stacks';

import './Tabs.css';

export type TabItem = {
  value: string;
  label: string;
  options?: {
    onValueChange: DropdownMenuRadioProps['onValueChange'];
    value: string;
    items: DropdownMenuRadioItem[];
  };
};

interface Props {
  label: string;
  value?: string;
  onChangeValue: (value: string) => void;
  tabs: TabItem[];
  tabListClassName?: string;
  className?: string;
  children: ReactNode;
}

export const Tabs = memo(function Tabs({
  value,
  onChangeValue,
  label,
  children,
  tabs,
  className,
  tabListClassName,
}: Props) {
  return (
    <T.Root
      value={value}
      onValueChange={onChangeValue}
      className={classnames(className, 'h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}
    >
      <T.List
        aria-label={label}
        className={classnames(tabListClassName, 'h-auto flex items-center pb-1')}
      >
        <ScrollArea>
          <HStack space={1}>
            {tabs.map((t) => {
              const isActive = t.value === value;
              if (t.options && isActive) {
                return (
                  <DropdownMenuRadio
                    key={t.value}
                    items={t.options.items}
                    value={t.options.value}
                    onValueChange={t.options.onValueChange}
                  >
                    <DropdownMenuTrigger>
                      <Button
                        color="custom"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className={classnames(
                          isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:text-gray-900',
                        )}
                      >
                        {t.options.items.find((i) => i.value === t.options?.value)?.label ?? ''}
                        <Icon icon="triangleDown" className="-mr-1.5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </DropdownMenuRadio>
                );
              } else if (t.options && !isActive) {
                return (
                  <T.Trigger asChild key={t.value} value={t.value}>
                    <Button
                      color="custom"
                      size="sm"
                      className={classnames(
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:text-gray-900',
                      )}
                    >
                      {t.options.items.find((i) => i.value === t.options?.value)?.label ?? ''}
                      <Icon icon="triangleDown" className="-mr-1.5 opacity-40" />
                    </Button>
                  </T.Trigger>
                );
              } else {
                return (
                  <T.Trigger asChild key={t.value} value={t.value}>
                    <Button
                      color="custom"
                      size="sm"
                      className={classnames(
                        isActive
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:text-gray-900',
                      )}
                    >
                      {t.label}
                    </Button>
                  </T.Trigger>
                );
              }
            })}
          </HStack>
        </ScrollArea>
      </T.List>
      {children}
    </T.Root>
  );
});

interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabContent = memo(function TabContent({
  value,
  children,
  className,
}: TabContentProps) {
  return (
    <T.Content
      tabIndex={-1}
      forceMount
      value={value}
      className={classnames(className, 'tab-content', 'w-full h-full overflow-auto')}
    >
      {children}
    </T.Content>
  );
});
