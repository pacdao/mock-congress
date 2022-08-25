import type { GetState, SetState } from "zustand";
import type { State } from "store/useStore";

import produce from "immer";

export type GlobalSlice = {
  width: number | null;
  headerHeight: number | null;

  setHeaderHeight: (headerHeight: number) => void;
  setWidth: (width: number) => void;
};

const createGlobalSlice = (set: SetState<State>, get: GetState<State>) => ({
  width: null,
  headerHeight: null,

  setHeaderHeight: (headerHeight: number) => {
    set(
      produce((state) => {
        state.headerHeight = headerHeight;
      })
    );
  },
  setWidth: (width: number) => {
    set(
      produce((state) => {
        state.width = width;
      })
    );
  },
});

export default createGlobalSlice;
