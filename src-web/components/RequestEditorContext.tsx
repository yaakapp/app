import EventEmitter from 'eventemitter3';
import type { DependencyList } from 'react';
import React, { createContext, useCallback, useContext, useEffect } from 'react';

interface State {
  focusParamValue: (name: string) => void;
  focusParamsTab: () => void;
}

export const RequestEditorContext = createContext<State>({} as State);

const emitter = new EventEmitter();

export const RequestEditorProvider = ({ children }: { children: React.ReactNode }) => {
  const focusParamsTab = useCallback(() => {
    emitter.emit('focus_http_request_params_tab');
  }, []);

  const focusParamValue = useCallback(
    (name: string) => {
      focusParamsTab();
      setTimeout(() => {
        emitter.emit('focus_http_request_param_value', name);
      }, 50);
    },
    [focusParamsTab],
  );

  const state: State = {
    focusParamValue,
    focusParamsTab,
  };

  return <RequestEditorContext.Provider value={state}>{children}</RequestEditorContext.Provider>;
};

export function useOnFocusParamValue(cb: (name: string) => void, deps: DependencyList) {
  useEffect(() => {
    emitter.on('focus_http_request_param_value', cb);
    return () => {
      emitter.off('focus_http_request_param_value', cb);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useOnFocusParamsTab(cb: () => void) {
  useEffect(() => {
    emitter.on('focus_http_request_params_tab', cb);
    return () => {
      emitter.off('focus_http_request_params_tab', cb);
    };
    // Only add callback once, to prevent the need for the caller to useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export const useRequestEditor = () => useContext(RequestEditorContext);
