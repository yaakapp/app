import React, { createContext, useContext, useMemo, useState } from 'react';
import { trackEvent } from '../lib/analytics';
import type { DialogProps } from './core/Dialog';
import { Dialog } from './core/Dialog';

type DialogEntry = {
  id: string;
  render: ({ hide }: { hide: () => void }) => React.ReactNode;
} & Omit<DialogProps, 'onClose' | 'open' | 'children'>;

interface State {
  dialogs: DialogEntry[];
  actions: Actions;
}

interface Actions {
  show: (d: DialogEntry) => void;
  toggle: (d: DialogEntry) => void;
  hide: (id: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogContext = createContext<State>({} as State);

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialogs, setDialogs] = useState<State['dialogs']>([]);
  const actions = useMemo<Actions>(
    () => ({
      show({ id, ...props }: DialogEntry) {
        trackEvent('dialog', 'show', { id });
        setDialogs((a) => [...a.filter((d) => d.id !== id), { id, ...props }]);
      },
      toggle({ id, ...props }: DialogEntry) {
        if (dialogs.some((d) => d.id === id)) this.hide(id);
        else this.show({ id, ...props });
      },
      hide: (id: string) => {
        setDialogs((a) => a.filter((d) => d.id !== id));
      },
    }),
    [dialogs],
  );

  const state: State = {
    dialogs,
    actions,
  };

  return <DialogContext.Provider value={state}>{children}</DialogContext.Provider>;
};

function DialogInstance({ id, render, ...props }: DialogEntry) {
  const { actions } = useContext(DialogContext);
  const children = render({ hide: () => actions.hide(id) });
  return (
    <Dialog open onClose={() => actions.hide(id)} {...props}>
      {children}
    </Dialog>
  );
}

export const useDialog = () => useContext(DialogContext).actions;

export function Dialogs() {
  const { dialogs } = useContext(DialogContext);
  return (
    <>
      {dialogs.map((props: DialogEntry) => (
        <DialogInstance key={props.id} {...props} />
      ))}
    </>
  );
}
