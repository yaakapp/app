import * as T from '@radix-ui/react-tabs';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '../Button';
import type { DropdownMenuRadioItem, DropdownMenuRadioProps } from '../Dropdown';
import { DropdownMenuRadio, DropdownMenuTrigger } from '../Dropdown';
import { Icon } from '../Icon';
import { HStack } from '../Stacks';

import './Tabs.css';

interface Props {
  defaultValue?: string;
  label: string;
  tabs: {
    value: string;
    label: string;
    options?: {
      onValueChange: DropdownMenuRadioProps['onValueChange'];
      value: string;
      items: DropdownMenuRadioItem[];
    };
  }[];
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
      className={classnames(className, 'h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}
    >
      <T.List
        aria-label={label}
        className={classnames(
          tabListClassName,
          'h-auto flex items-center overflow-x-auto mb-1 pb-1',
        )}
      >
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
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900',
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
                      isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900',
                    )}
                  >
                    {t.label}
                  </Button>
                </T.Trigger>
              );
            }
          })}
        </HStack>
      </T.List>
      {children}
    </T.Root>
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
      className={classnames(className, 'tab-content', 'w-full h-full overflow-auto')}
    >
      {children}
    </T.Content>
  );
}
