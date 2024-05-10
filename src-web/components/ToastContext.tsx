import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import type { ToastProps } from './core/Toast';
import { Toast } from './core/Toast';
import { generateId } from '../lib/generateId';
import { Portal } from './Portal';
import { AnimatePresence } from 'framer-motion';

type ToastEntry = {
  render: ({ hide }: { hide: () => void }) => React.ReactNode;
  timeout?: number;
} & Omit<ToastProps, 'onClose' | 'open' | 'children' | 'timeout'>;

type PrivateToastEntry = ToastEntry & {
  id: string;
  timeout: number;
};

interface State {
  toasts: PrivateToastEntry[];
  actions: Actions;
}

interface Actions {
  show: (d: ToastEntry) => void;
  hide: (id: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ToastContext = createContext<State>({} as State);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<State['toasts']>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const actions = useMemo<Actions>(
    () => ({
      show({ timeout = 4000, ...props }: ToastEntry) {
        const id = generateId();
        timeoutRef.current = setTimeout(() => {
          this.hide(id);
        }, timeout);
        setToasts((a) => [...a.filter((d) => d.id !== id), { id, timeout, ...props }]);
        return id;
      },
      hide: (id: string) => {
        setToasts((a) => a.filter((d) => d.id !== id));
      },
    }),
    [],
  );

  const state: State = { toasts, actions };

  return (
    <ToastContext.Provider value={state}>
      {children}
      <Portal name="toasts">
        <div className="absolute right-0 bottom-0">
          <AnimatePresence>
            {toasts.map((props: PrivateToastEntry) => (
              <ToastInstance key={props.id} {...props} />
            ))}
          </AnimatePresence>
        </div>
      </Portal>
    </ToastContext.Provider>
  );
};

function ToastInstance({ id, render, timeout, ...props }: PrivateToastEntry) {
  const { actions } = useContext(ToastContext);
  const children = render({ hide: () => actions.hide(id) });
  return (
    <Toast open timeout={timeout} onClose={() => actions.hide(id)} {...props}>
      {children}
    </Toast>
  );
}

export const useToast = () => useContext(ToastContext).actions;
