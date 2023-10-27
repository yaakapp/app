import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import { motion } from 'framer-motion';
import type { CSSProperties, HTMLAttributes, MouseEvent, ReactElement, ReactNode } from 'react';
import React, {
  Children,
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useKey, useKeyPressEvent } from 'react-use';
import { Portal } from '../Portal';
import { Button } from './Button';
import { Separator } from './Separator';
import { VStack } from './Stacks';

export type DropdownItemSeparator = {
  type: 'separator';
  label?: string;
};

export type DropdownItem =
  | {
      key: string;
      type?: 'default';
      label: ReactNode;
      variant?: 'danger';
      disabled?: boolean;
      hidden?: boolean;
      leftSlot?: ReactNode;
      rightSlot?: ReactNode;
      onSelect?: () => void;
    }
  | DropdownItemSeparator;

export interface DropdownProps {
  children: ReactElement<HTMLAttributes<HTMLButtonElement>>;
  items: DropdownItem[];
}

export interface DropdownRef {
  isOpen: boolean;
  open: (activeIndex?: number) => void;
  toggle: (activeIndex?: number) => void;
  close?: () => void;
  next?: () => void;
  prev?: () => void;
  select?: () => void;
}

export const Dropdown = forwardRef<DropdownRef, DropdownProps>(function Dropdown(
  { children, items }: DropdownProps,
  ref,
) {
  const [open, setOpen] = useState<boolean>(false);
  const [defaultSelectedIndex, setDefaultSelectedIndex] = useState<number>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<Omit<DropdownRef, 'open'>>(null);

  useImperativeHandle(ref, () => ({
    ...menuRef.current,
    isOpen: open,
    toggle (activeIndex?: number) {
      if (!open) this.open(activeIndex);
      else setOpen(false);
    },
    open(activeIndex?: number) {
      if (activeIndex === undefined) {
        setDefaultSelectedIndex(undefined);
      } else {
        setDefaultSelectedIndex(activeIndex >= 0 ? activeIndex : items.length + activeIndex);
      }
      setOpen(true);
    },
  }));

  const child = useMemo(() => {
    const existingChild = Children.only(children);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: any = {
      ...existingChild.props,
      ref: buttonRef,
      'aria-haspopup': 'true',
      onClick:
        existingChild.props?.onClick ??
        ((e: MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          e.stopPropagation();
          setDefaultSelectedIndex(undefined);
          setOpen((o) => !o);
        }),
    };
    return cloneElement(existingChild, props);
  }, [children]);

  const handleClose = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    buttonRef.current?.setAttribute('aria-expanded', open.toString());
  }, [open]);

  const triggerRect = useMemo(() => {
    if (!open) return null;
    return buttonRef.current?.getBoundingClientRect();
  }, [open]);

  return (
    <>
      {child}
      {open && triggerRect && (
        <Menu
          ref={menuRef}
          defaultSelectedIndex={defaultSelectedIndex}
          items={items}
          triggerRect={triggerRect}
          onClose={handleClose}
        />
      )}
    </>
  );
});

interface MenuProps {
  className?: string;
  defaultSelectedIndex?: number;
  items: DropdownProps['items'];
  triggerRect: DOMRect;
  onClose: () => void;
}

const Menu = forwardRef<Omit<DropdownRef, 'open' | 'isOpen' | 'toggle'>, MenuProps>(function Menu(
  { className, items, onClose, triggerRect, defaultSelectedIndex }: MenuProps,
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(defaultSelectedIndex ?? null);
  const [menuStyles, setMenuStyles] = useState<CSSProperties>({});

  // Calculate the max height so we can scroll
  const initMenu = useCallback((el: HTMLDivElement | null) => {
    if (el === null) return {};
    const windowBox = document.documentElement.getBoundingClientRect();
    const menuBox = el.getBoundingClientRect();
    setMenuStyles({ maxHeight: windowBox.height - menuBox.top - 5 });
  }, []);

  // Close menu on space bar
  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useKeyPressEvent('Escape', (e) => {
    e.preventDefault();
    onClose();
  });

  const handlePrev = useCallback(() => {
    setSelectedIndex((currIndex) => {
      let nextIndex = (currIndex ?? 0) - 1;
      const maxTries = items.length;
      for (let i = 0; i < maxTries; i++) {
        if (items[nextIndex]?.type === 'separator') {
          nextIndex--;
        } else if (nextIndex < 0) {
          nextIndex = items.length - 1;
        } else {
          break;
        }
      }
      return nextIndex;
    });
  }, [items]);

  const handleNext = useCallback(() => {
    setSelectedIndex((currIndex) => {
      let nextIndex = (currIndex ?? -1) + 1;
      const maxTries = items.length;
      for (let i = 0; i < maxTries; i++) {
        if (items[nextIndex]?.type === 'separator') {
          nextIndex++;
        } else if (nextIndex >= items.length) {
          nextIndex = 0;
        } else {
          break;
        }
      }
      return nextIndex;
    });
  }, [items]);

  useKey('ArrowUp', (e) => {
    e.preventDefault();
    handlePrev();
  });

  useKey('ArrowDown', (e) => {
    e.preventDefault();
    handleNext();
  });

  const handleSelect = useCallback(
    (i: DropdownItem) => {
      onClose();
      setSelectedIndex(null);
      if (i.type !== 'separator') {
        i.onSelect?.();
      }
    },
    [onClose],
  );

  useImperativeHandle(
    ref,
    () => ({
      close: onClose,
      prev: handlePrev,
      next: handleNext,
      select: () => {
        const item = items[selectedIndex ?? -1] ?? null;
        if (!item) return;
        handleSelect(item);
      },
    }),
    [handleNext, handlePrev, handleSelect, items, onClose, selectedIndex],
  );

  const { containerStyles, triangleStyles } = useMemo<{
    containerStyles: CSSProperties;
    triangleStyles: CSSProperties;
  }>(() => {
    const docWidth = document.documentElement.getBoundingClientRect().width;
    const spaceRemaining = docWidth - triggerRect.left;
    const top = triggerRect?.bottom + 5;
    const onRight = spaceRemaining < 200;
    const containerStyles = onRight
      ? { top, right: docWidth - triggerRect?.right }
      : { top, left: triggerRect?.left };
    const size = { top: '-0.2rem', width: '0.4rem', height: '0.4rem' };
    const triangleStyles = onRight
      ? { right: triggerRect.width / 2, marginRight: '-0.2rem', ...size }
      : { left: triggerRect.width / 2, marginLeft: '-0.2rem', ...size };
    return { containerStyles, triangleStyles };
  }, [triggerRect]);

  const handleFocus = useCallback(
    (i: DropdownItem) => {
      const index = items.findIndex((item) => item === i) ?? null;
      setSelectedIndex(index);
    },
    [items],
  );

  if (items.length === 0) return null;

  return (
    <Portal name="dropdown">
      <FocusTrap>
        <div>
          <div tabIndex={-1} aria-hidden className="fixed inset-0" onClick={onClose} />
          <motion.div
            tabIndex={0}
            onKeyDown={handleMenuKeyDown}
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            role="menu"
            aria-orientation="vertical"
            dir="ltr"
            ref={containerRef}
            style={containerStyles}
            className={classNames(className, 'outline-none mt-1 pointer-events-auto fixed z-50')}
          >
            <span
              aria-hidden
              style={triangleStyles}
              className="bg-gray-50 absolute rotate-45 border-gray-200 border-t border-l"
            />
            {containerStyles && (
              <VStack
                space={0.5}
                ref={initMenu}
                style={menuStyles}
                className={classNames(
                  className,
                  'h-auto bg-gray-50 rounded-md shadow-lg dark:shadow-gray-0 py-1.5 border',
                  'border-gray-200 overflow-auto mb-1 mx-0.5',
                )}
              >
                {items.map((item, i) => {
                  if (item.type === 'separator') {
                    return <Separator key={i} className="my-1.5" label={item.label} />;
                  }
                  if (item.hidden) {
                    return null;
                  }
                  return (
                    <MenuItem
                      focused={i === selectedIndex}
                      onFocus={handleFocus}
                      onSelect={handleSelect}
                      key={item.key}
                      item={item}
                    />
                  );
                })}
              </VStack>
            )}
          </motion.div>
        </div>
      </FocusTrap>
    </Portal>
  );
});

interface MenuItemProps {
  className?: string;
  item: DropdownItem;
  onSelect: (item: DropdownItem) => void;
  onFocus: (item: DropdownItem) => void;
  focused: boolean;
}

function MenuItem({ className, focused, onFocus, item, onSelect, ...props }: MenuItemProps) {
  const handleClick = useCallback(() => onSelect?.(item), [item, onSelect]);
  const handleFocus = useCallback(() => onFocus?.(item), [item, onFocus]);

  const initRef = useCallback(
    (el: HTMLButtonElement | null) => {
      if (el === null) return;
      if (focused) {
        setTimeout(() => el.focus(), 0);
      }
    },
    [focused],
  );

  if (item.type === 'separator') return <Separator className="my-1.5" />;

  return (
    <Button
      ref={initRef}
      size="xs"
      tabIndex={-1}
      onMouseEnter={(e) => e.currentTarget.focus()}
      onMouseLeave={(e) => e.currentTarget.blur()}
      onFocus={handleFocus}
      onClick={handleClick}
      justify="start"
      className={classNames(
        className,
        'min-w-[8rem] outline-none px-2 mx-1.5 flex text-sm text-gray-700 whitespace-nowrap',
        'focus:bg-highlight focus:text-gray-900 rounded',
        item.variant === 'danger' && 'text-red-600',
      )}
      {...props}
    >
      {item.leftSlot && <div className="pr-2 flex justify-start">{item.leftSlot}</div>}
      <div
        className={classNames(
          // Add padding on right when no right slot, for some visual balance
          !item.rightSlot && 'pr-4',
        )}
      >
        {item.label}
      </div>
      {item.rightSlot && <div className="ml-auto pl-3">{item.rightSlot}</div>}
    </Button>
  );
}
