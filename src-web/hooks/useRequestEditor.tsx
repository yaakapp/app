import EventEmitter from 'eventemitter3';
import type { DependencyList } from 'react';
import { useCallback, useEffect } from 'react';

type EventDataMap = {
  'request_params.focus_value': string;
  'request_pane.focus_tab': undefined;
};

export function useRequestEditorEvent<
  Event extends keyof EventDataMap,
  Data extends EventDataMap[Event],
>(event: Event, fn: (data: Data) => void, deps?: DependencyList) {
  useEffect(() => {
    emitter.on(event, fn);
    return () => {
      emitter.off(event, fn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useRequestEditor() {
  const focusParamsTab = useCallback(() => {
    emitter.emit('request_pane.focus_tab', undefined);
  }, []);

  const focusParamValue = useCallback(
    (name: string) => {
      focusParamsTab();
      setTimeout(() => emitter.emit('request_params.focus_value', name), 50);
    },
    [focusParamsTab],
  );

  return {
    focusParamValue,
    focusParamsTab,
  };
}

const emitter = new (class RequestEditorEventEmitter {
  #emitter: EventEmitter = new EventEmitter();

  emit<Event extends keyof EventDataMap, Data extends EventDataMap[Event]>(
    event: Event,
    data: Data,
  ) {
    this.#emitter.emit(event, data);
  }

  on<Event extends keyof EventDataMap, Data extends EventDataMap[Event]>(
    event: Event,
    fn: (data: Data) => void,
  ) {
    this.#emitter.on(event, fn);
  }

  off<Event extends keyof EventDataMap, Data extends EventDataMap[Event]>(
    event: Event,
    fn: (data: Data) => void,
  ) {
    this.#emitter.off(event, fn);
  }
})();
