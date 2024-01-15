import classNames from 'classnames';
import { motion } from 'framer-motion';
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react';
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
import { useKey, useKeyPressEvent, useWindowSize } from 'react-use';
import type { HotkeyAction } from '../../hooks/useHotKey';
import { useHotKey } from '../../hooks/useHotKey';
import { Overlay } from '../Overlay';
import { Button } from './Button';
import { HotKey } from './HotKey';
import { Separator } from './Separator';
import { VStack } from './Stacks';

export type DropdownItemSeparator = {
  type: 'separator';
  label?: string;
};

export type DropdownItemDefault = {
  key: string;
  type?: 'default';
  label: ReactNode;
  hotkeyAction?: HotkeyAction;
  variant?: 'danger';
  disabled?: boolean;
  hidden?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  onSelect?: () => void;
};

export type DropdownItem = DropdownItemDefault | DropdownItemSeparator;

export interface DropdownProps {
  children: ReactElement<HTMLAttributes<HTMLButtonElement>>;
  items: DropdownItem[];
  openOnHotKeyAction?: HotkeyAction;
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
  { children, items, openOnHotKeyAction }: DropdownProps,
  ref,
) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [defaultSelectedIndex, setDefaultSelectedIndex] = useState<number>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<Omit<DropdownRef, 'open'>>(null);

  useHotKey(openOnHotKeyAction ?? null, () => {
    setIsOpen(true);
  });

  useImperativeHandle(ref, () => ({
    ...menuRef.current,
    isOpen: isOpen,
    toggle(activeIndex?: number) {
      if (!isOpen) this.open(activeIndex);
      else setIsOpen(false);
    },
    open(activeIndex?: number) {
      if (activeIndex === undefined) {
        setDefaultSelectedIndex(undefined);
      } else {
        setDefaultSelectedIndex(activeIndex >= 0 ? activeIndex : items.length + activeIndex);
      }
      setIsOpen(true);
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
          setIsOpen((o) => !o);
        }),
    };
    return cloneElement(existingChild, props);
  }, [children]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    buttonRef.current?.setAttribute('aria-expanded', isOpen.toString());
  }, [isOpen]);

  const windowSize = useWindowSize();
  const triggerRect = useMemo(() => {
    if (!windowSize) return null; // No-op to TS happy with this dep
    if (!isOpen) return null;
    return buttonRef.current?.getBoundingClientRect();
  }, [isOpen, windowSize]);

  return (
    <>
      {child}
      <Menu
        ref={menuRef}
        showTriangle
        defaultSelectedIndex={defaultSelectedIndex}
        items={items}
        triggerShape={triggerRect ?? null}
        onClose={handleClose}
        isOpen={isOpen}
      />
    </>
  );
});

interface ContextMenuProps {
  show: { x: number; y: number } | null;
  className?: string;
  items: DropdownProps['items'];
  onClose: () => void;
}

export const ContextMenu = forwardRef<DropdownRef, ContextMenuProps>(function ContextMenu(
  { show, className, items, onClose },
  ref,
) {
  const triggerShape = useMemo(
    () => ({
      top: show?.y ?? 0,
      bottom: show?.y ?? 0,
      left: show?.x ?? 0,
      right: show?.x ?? 0,
    }),
    [show],
  );

  return (
    <Menu
      className={className}
      ref={ref}
      items={items}
      isOpen={show != null}
      onClose={onClose}
      triggerShape={triggerShape}
    />
  );
});

interface MenuProps {
  className?: string;
  defaultSelectedIndex?: number;
  items: DropdownProps['items'];
  triggerShape: Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'> | null;
  onClose: () => void;
  showTriangle?: boolean;
  isOpen: boolean;
}

const Menu = forwardRef<Omit<DropdownRef, 'open' | 'isOpen' | 'toggle'>, MenuProps>(function Menu(
  {
    className,
    isOpen,
    items,
    onClose,
    triggerShape,
    defaultSelectedIndex,
    showTriangle,
  }: MenuProps,
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
    triangleStyles: CSSProperties | null;
  }>(() => {
    if (triggerShape == null) return { containerStyles: {}, triangleStyles: null };

    const docRect = document.documentElement.getBoundingClientRect();
    const width = triggerShape.right - triggerShape.left;
    const hSpaceRemaining = docRect.width - triggerShape.left;
    const vSpaceRemaining = docRect.height - triggerShape.bottom;
    const top = triggerShape?.bottom + 5;
    const onRight = hSpaceRemaining < 200;
    const upsideDown = vSpaceRemaining < 200;
    const containerStyles = {
      top: !upsideDown ? top : undefined,
      bottom: upsideDown ? docRect.height - top : undefined,
      right: onRight ? docRect.width - triggerShape?.right : undefined,
      left: !onRight ? triggerShape?.left : undefined,
    };
    const size = { top: '-0.2rem', width: '0.4rem', height: '0.4rem' };
    const triangleStyles = onRight
      ? { right: width / 2, marginRight: '-0.2rem', ...size }
      : { left: width / 2, marginLeft: '-0.2rem', ...size };
    return { containerStyles, triangleStyles };
  }, [triggerShape]);

  const handleFocus = useCallback(
    (i: DropdownItem) => {
      const index = items.findIndex((item) => item === i) ?? null;
      setSelectedIndex(index);
    },
    [items],
  );

  if (items.length === 0) return null;

  return (
    <>
      {items.map(
        (item) =>
          item.type !== 'separator' && (
            <MenuItemHotKey
              key={item.key}
              onSelect={handleSelect}
              item={item}
              action={item.hotkeyAction}
            />
          ),
      )}
      {isOpen && (
        <Overlay open variant="transparent" portalName="dropdown" zIndex={50}>
          <div>
            <div tabIndex={-1} aria-hidden className="fixed inset-0 z-30" onClick={onClose} />
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
              className={classNames(className, 'outline-none my-1 pointer-events-auto fixed z-50')}
            >
              {triangleStyles && showTriangle && (
                <span
                  aria-hidden
                  style={triangleStyles}
                  className="bg-gray-50 absolute rotate-45 border-gray-200 border-t border-l"
                />
              )}
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
                      return (
                        <Separator key={i} className="my-1.5">
                          {item.label}
                        </Separator>
                      );
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
        </Overlay>
      )}
    </>
  );
});

interface MenuItemProps {
  className?: string;
  item: DropdownItemDefault;
  onSelect: (item: DropdownItemDefault) => void;
  onFocus: (item: DropdownItemDefault) => void;
  focused: boolean;
}

function MenuItem({ className, focused, onFocus, item, onSelect, ...props }: MenuItemProps) {
  const handleClick = useCallback(() => onSelect?.(item), [item, onSelect]);
  const handleFocus = useCallback(
    (e: ReactFocusEvent<HTMLButtonElement>) => {
      e.stopPropagation(); // Don't trigger focus on any parents
      return onFocus?.(item);
    },
    [item, onFocus],
  );

  const initRef = useCallback(
    (el: HTMLButtonElement | null) => {
      if (el === null) return;
      if (focused) {
        setTimeout(() => el.focus(), 0);
      }
    },
    [focused],
  );

  const rightSlot = item.rightSlot ?? <HotKey action={item.hotkeyAction ?? null} />;

  return (
    <Button
      ref={initRef}
      size="xs"
      tabIndex={-1}
      onMouseEnter={(e) => e.currentTarget.focus()}
      onMouseLeave={(e) => e.currentTarget.blur()}
      disabled={item.disabled}
      onFocus={handleFocus}
      onClick={handleClick}
      justify="start"
      leftSlot={item.leftSlot && <div className="pr-2 flex justify-start">{item.leftSlot}</div>}
      rightSlot={rightSlot && <div className="ml-auto pl-3">{rightSlot}</div>}
      className={classNames(
        className,
        'min-w-[8rem] outline-none px-2 mx-1.5 flex text-sm text-gray-700 whitespace-nowrap',
        'focus:bg-highlight focus:text-gray-900 rounded',
        item.variant === 'danger' && 'text-red-600',
      )}
      innerClassName="!text-left"
      {...props}
    >
      <div
        className={classNames(
          // Add padding on right when no right slot, for some visual balance
          !item.rightSlot && 'pr-4',
        )}
      >
        {item.label}
      </div>
    </Button>
  );
}

interface MenuItemHotKeyProps {
  action: HotkeyAction | undefined;
  onSelect: MenuItemProps['onSelect'];
  item: MenuItemProps['item'];
}

function MenuItemHotKey({ action, onSelect, item }: MenuItemHotKeyProps) {
  useHotKey(action ?? null, () => onSelect(item));
  return null;
}
