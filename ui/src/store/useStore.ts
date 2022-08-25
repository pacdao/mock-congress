import type { SetState, GetState } from "zustand";

import create from "zustand";
import { devtools } from "zustand/middleware";

import createGlobalSlice, { GlobalSlice } from "store/createGlobalSlice";
import createCongressesSlice, { CongressesSlice } from "store/createCongressesSlice";
import { isDevelopment } from "utils";
import createNftSlice, { NftSlice } from "store/createNftSlice";

export type State = GlobalSlice & CongressesSlice & NftSlice;

const store = (set: SetState<State>, get: GetState<State>): State => ({
  ...createGlobalSlice(set, get),
  ...createCongressesSlice(set, get),
  ...createNftSlice(set, get),
});

const devtoolsStore = devtools(store);
const useStore = isDevelopment ? create(devtoolsStore) : create(store);

export default useStore;
