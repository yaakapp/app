import React, { createContext, useContext, useMemo, useState } from 'react';

interface State {
  actions: Actions;
  focusParamValueCallbacks: ((index: number) => void)[];
}

interface Actions {
  focusParamValue: (index: number) => void;
  onFocusParamValue: (cb: (index: number) => void) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RequestPaneContext = createContext<State>({} as State);

export const RequestPaneProvider = ({ children }: { children: React.ReactNode }) => {
  const [focusParamValueCallbacks, setFocusParamValueCallbacks] = useState<
    State['focusParamValueCallbacks']
  >([]);

  const actions = useMemo<Actions>(
    () => ({
      focusParamValue(index) {
        focusParamValueCallbacks.forEach((cb) => cb(index));
      },
      onFocusParamValue(cb) {
        setFocusParamValueCallbacks((callbacks) => [...callbacks, cb]);
      },
    }),
    [focusParamValueCallbacks],
  );

  const state: State = { actions, focusParamValueCallbacks };
  return <RequestPaneContext.Provider value={state}>{children}</RequestPaneContext.Provider>;
};

export const useRequestPane = () => useContext(RequestPaneContext).actions;
