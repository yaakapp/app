import classNames from 'classnames';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect, useRef } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import type { RadioDropdownProps } from '../RadioDropdown';
import { RadioDropdown } from '../RadioDropdown';
import { HStack } from '../Stacks';

export type TabItem =
  | {
      value: string;
      label: ReactNode;
    }
  | {
      value: string;
      options: Omit<RadioDropdownProps, 'children'>;
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

export function Tabs({
  value,
  onChangeValue,
  label,
  children,
  tabs,
  className,
  tabListClassName,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleTabChange = useCallback(
    (value: string) => {
      const tabs = ref.current?.querySelectorAll<HTMLDivElement>(`[data-tab]`);
      for (const tab of tabs ?? []) {
        const v = tab.getAttribute('data-tab');
        if (v === value) {
          tab.setAttribute('tabindex', '-1');
          tab.setAttribute('data-state', 'active');
          tab.setAttribute('aria-hidden', 'false');
          tab.style.display = 'block';
        } else {
          tab.setAttribute('data-state', 'inactive');
          tab.setAttribute('aria-hidden', 'true');
          tab.style.display = 'none';
        }
      }
      onChangeValue(value);
    },
    [onChangeValue],
  );

  useEffect(() => {
    if (value === undefined) return;
    handleTabChange(value);
  }, [handleTabChange, value]);

  return (
    <div
      ref={ref}
      className={classNames(className, 'h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}
    >
      <div
        aria-label={label}
        className={classNames(
          tabListClassName,
          'flex items-center overflow-x-auto overflow-y-visible hide-scrollbars mt-1 mb-2',
          // Give space for button focus states within overflow boundary.
          '-ml-5 pl-3 pr-1 py-1',
        )}
      >
        <HStack space={2} className="flex-shrink-0">
          {tabs.map((t) => {
            const isActive = t.value === value;
            const btnClassName = classNames(
              isActive ? 'text-fg' : 'text-fg-subtler hover:text-fg-subtle',
              '!px-2 ml-[1px]',
            );

            if ('options' in t) {
              const option = t.options.items.find(
                (i) => 'value' in i && i.value === t.options?.value,
              );
              return (
                <RadioDropdown
                  key={t.value}
                  items={t.options.items}
                  value={t.options.value}
                  onChange={t.options.onChange}
                >
                  <Button
                    color="custom"
                    size="sm"
                    onClick={isActive ? undefined : () => handleTabChange(t.value)}
                    className={btnClassName}
                    rightSlot={
                      <Icon
                        size="sm"
                        icon="chevronDown"
                        className={classNames(
                          '-mr-1.5 mt-0.5',
                          isActive ? 'text-fg-subtle' : 'opacity-50',
                        )}
                      />
                    }
                  >
                    {option && 'shortLabel' in option
                      ? option.shortLabel
                      : option?.label ?? 'Unknown'}
                  </Button>
                </RadioDropdown>
              );
            } else {
              return (
                <Button
                  key={t.value}
                  color="custom"
                  size="sm"
                  onClick={() => handleTabChange(t.value)}
                  className={btnClassName}
                >
                  {t.label}
                </Button>
              );
            }
          })}
        </HStack>
      </div>
      {children}
    </div>
  );
}

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
    <div
      tabIndex={-1}
      data-tab={value}
      className={classNames(className, 'tab-content', 'hidden w-full h-full')}
    >
      {children}
    </div>
  );
});
