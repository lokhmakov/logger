import * as effector from 'effector';
import { createName } from './lib';

/* eslint-disable @typescript-eslint/ban-ts-ignore, @typescript-eslint/no-explicit-any */
const reduxDevTools =
  // @ts-ignore
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__;

const rootState: Record<string, any> = {};

export const updateStore = (name: string, state: any): void => {
  if (reduxDevTools) {
    rootState[name] = state;
  }
};

export const log = (
  type: string,
  name: string,
  payload: any,
  result?: any,
): void => {
  if (reduxDevTools) {
    if (type === 'STORE') {
      updateStore(name, payload);
    }
    reduxDevTools.send({ type: `${type} ${name}`, payload, result }, rootState);
  }
};

export function eventCalled(name: string, payload: any): void {
  if (reduxDevTools) {
    reduxDevTools.send({ type: `${name} (event)`, payload }, rootState);
  }
}

function setState(name: string, value: any): void {
  rootState[name] = value;
}

export function storeAdded(store: effector.Store<any>): void {
  const name = createName(store.compositeName);

  setState(name, store.defaultState);
}

export function storeUpdated(name: string, value: any): void {
  setState(name, value);

  if (reduxDevTools) {
    reduxDevTools.send({ type: `${name} (store updated)`, value }, rootState);
  }
}

type Effect = effector.Effect<any, any, any>;

function effectUpdateState(name: string, effect: Effect): void {
  setState(name, {
    inFlight: effect.inFlight.getState(),
    pending: effect.pending.getState(),
  });
}

export function effectAdded(name: string, effect: Effect): void {
  effectUpdateState(name, effect);
}

export function effectCalled(
  name: string,
  effect: Effect,
  parameters: any,
): void {
  effectUpdateState(name, effect);

  if (reduxDevTools) {
    reduxDevTools.send(
      { type: `${name} (effect called)`, params: parameters },
      rootState,
    );
  }
}

export function effectDone(
  name: string,
  effect: Effect,
  parameters: any,
  result: any,
): void {
  effectUpdateState(name, effect);

  if (reduxDevTools) {
    reduxDevTools.send(
      { type: `${name}.done (effect finished)`, params: parameters, result },
      rootState,
    );
  }
}

export function effectFail(
  name: string,
  effect: Effect,
  parameters: any,
  error: any,
): void {
  effectUpdateState(name, effect);

  if (reduxDevTools) {
    reduxDevTools.send(
      { type: `${name}.fail (effect finished)`, params: parameters, error },
      rootState,
    );
  }
}