import type { GetState, SetState } from "zustand";
import type { State } from "store/useStore";
import type { State as SelectedState } from "constants/index";

import produce from "immer";

import { getVotes, RespVote } from "services/api";

type CongressState = {
  congress: RespVote[];
  error: string;
  loaded: boolean;
  loading: boolean;
  selectedState: SelectedState | string;

  fetchCongress: (address: string) => Promise<void>;
  setSelectedState: (selectedState: State | string) => void;
};

export type CongressesSlice = {
  congress: CongressState;
};

const createCongressesSlice = (set: SetState<State>, get: GetState<State>) => ({
  congress: {
    congress: [],
    loaded: false,
    loading: false,
    error: "",
    selectedState: "",
    nft: {
      auctionIndex: [],
      contract: null,
    },

    fetchCongress: async () => {
      try {
        set(
          produce((state) => {
            state.congress.loading = true;
          })
        );

        const fetchedCongress = await getVotes();

        set(
          produce((state) => {
            state.congress.congress = fetchedCongress;
            state.congress.loading = false;
            state.congress.loaded = true;
          })
        );
      } catch (error) {
        console.error(error);
        set(
          produce((state) => {
            state.congress.error = "Unable to get list of congress, please try again later.";
            state.congress.loading = false;
          })
        );
      }
    },
    setSelectedState: (selectedState: State | string) => {
      set(
        produce((state) => {
          state.congress.selectedState = selectedState;
        })
      );
    },
  },
});

export default createCongressesSlice;
