import React, { createContext, useContext, useMemo, useState } from 'react';
import type { DialogProps } from './core/Dialog';
import { Dialog } from './core/Dialog';

type DialogEntry = {
  id: string;
  render: ({ hide }: { hide: () => void }) => React.ReactNode;
} & Pick<DialogProps, 'title' | 'description' | 'hideX' | 'className' | 'size'>;

type DialogEntryOptionalId = Omit<DialogEntry, 'id'> & { id?: string };

interface State {
  dialogs: DialogEntry[];
  actions: Actions;
}

interface Actions {
  show: (d: DialogEntryOptionalId) => void;
  hide: (id: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogContext = createContext<State>({} as any);

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialogs, setDialogs] = useState<State['dialogs']>([]);
  const actions = useMemo<Actions>(
    () => ({
      show: ({ id: oid, ...props }: DialogEntryOptionalId) => {
        const id = oid ?? Math.random().toString(36).slice(2);
        setDialogs((a) => [...a.filter((d) => d.id !== id), { id, ...props }]);
      },
      hide: (id: string) => {
        setDialogs((a) => a.filter((d) => d.id !== id));
      },
    }),
    [],
  );

  const state: State = {
    dialogs,
    actions,
  };

  return (
    <DialogContext.Provider value={state}>
      {children}
      {dialogs.map((props: DialogEntry) => (
        <DialogInstance key={props.id} {...props} />
      ))}
    </DialogContext.Provider>
  );
};

function DialogInstance({ id, render, ...props }: DialogEntry) {
  const { actions } = useContext(DialogContext);
  return (
    <Dialog open onClose={() => actions.hide(id)} {...props}>
      {render({ hide: () => actions.hide(id) })}
    </Dialog>
  );
}

export const useDialog = () => useContext(DialogContext).actions;
