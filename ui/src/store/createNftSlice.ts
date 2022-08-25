import type { GetState, SetState } from "zustand";
import type { State } from "store/useStore";

import produce from "immer";
import { BigNumber, ethers } from "ethers";

import CongressKittiesNFT from "contract/congress_kitties_nft";

type NftState = {
  auctionDeadlines: number[];
  auctionMaxBids: string[];
  auctionStatuses: number[];
  seatWinners: string[];
  seatsMinted: boolean[];

  userBids: string[];
  redeemableBalances: string;

  userAddress: string;
  minPrice: BigNumber;
  minBidIncrement: BigNumber;
  minBidIncrementString: string;
  contract: ethers.Contract | null;
  signerContract: ethers.Contract | null;

  hasLoaded: boolean;

  setContract: (provider: ethers.providers.Web3Provider | null, userAddress: string | null) => Promise<void>;
  loadContractData: (isRefetch?: boolean) => Promise<void>;
  setSignerContract: (signer: ethers.providers.JsonRpcSigner) => Promise<void>;
};

export type NftSlice = {
  nft: NftState;
};

const options = { gasLimit: 1000000000 };

const createNftSlice = (set: SetState<State>, get: GetState<State>) => ({
  nft: {
    auctionDeadlines: [],
    auctionMaxBids: [],
    auctionStatuses: [],
    seatWinners: [],
    seatsMinted: [],

    userBids: [],
    redeemableBalances: "",

    userAddress: "",
    minPrice: BigNumber.from(0),
    minBidIncrement: BigNumber.from(0),
    minBidIncrementString: "0.01",
    contract: null,
    signerContract: null,

    hasLoaded: false,

    loadContractData: async (isRefetch?: boolean) => {
      try {
        const contract = get().nft.contract;
        const userAddress: string = get().nft.userAddress;

        if (!isRefetch) {
          set(
            produce((state: State) => {
              state.nft.hasLoaded = false;
            })
          );
        }

        let parsedUserBids: number[] = [];
        let userRedeemableBalances = "";

        // // list of all auction deadlinest
        // // auction_deadlines gives you the current timestamp of the auction deadline
        // // (if the mint was closed out in some other fashion and the seat is unavailable it returns the current timestamp)

        // // auction_statuses new returns a 0 if the seat is up for grabs,
        // // a 1 if it's in the middle of an auction, and a 2 if the auction is complete (or otherwise the mint was close out)

        // // auction_statuses new returns a 0 if the seat is up for grabs,
        // // a 1 if it's in the middle of an auction, and a 2 if the auction is complete (or otherwise the mint was close out)

        // user_bids returns user bid amounts for each seat.

        const [
          fetchedAuctionDeadlines,
          fetchedAuctionMaxBids,
          fetchedAuctionStatuses,
          fetchedSeatWinners,
          fetchedMintedSeats,
          fetchedMinPrice,
          fetchedMinIncrement,
          fetchedUserBids,
          fetchedBalances,
        ] = await Promise.all([
          contract?.auction_deadlines(options),
          contract?.auction_max_bids(options),
          contract?.auction_statuses(options),
          contract?.seat_winners(options),
          contract?.mint_statuses(options),
          contract?.min_price(options),
          contract?.auction_interval(options),
          userAddress ? contract?.user_bids(userAddress, options) : [],
          userAddress ? contract?.redeemable_balance(userAddress, options) : [],
        ]);

        const parsedAuctionDeadlines = fetchedAuctionDeadlines.map((val: BigNumber) => val.toNumber());
        const parsedAuctionMaxBids = fetchedAuctionMaxBids.map((val: BigNumber) => ethers.utils.formatEther(val));
        const parsedAuctionStatuses = fetchedAuctionStatuses.map((val: BigNumber) => val.toNumber()); //AuctionStates[val.toNumber()]);

        if (userAddress) {
          parsedUserBids = fetchedUserBids.map((val: BigNumber) => ethers.utils.formatEther(val));
          userRedeemableBalances = ethers.utils.formatEther(fetchedBalances);
        }
        set(
          produce((state) => {
            state.nft.auctionDeadlines = parsedAuctionDeadlines;
            state.nft.auctionMaxBids = parsedAuctionMaxBids;
            state.nft.auctionStatuses = parsedAuctionStatuses;
            state.nft.seatWinners = fetchedSeatWinners;
            state.nft.seatsMinted = fetchedMintedSeats;
            state.nft.userBids = parsedUserBids;
            state.nft.redeemableBalances = userRedeemableBalances;
            state.nft.minPrice = fetchedMinPrice;
            state.nft.minBidIncrement = fetchedMinIncrement;
            state.nft.minBidIncrementString = ethers.utils.formatEther(fetchedMinIncrement);
            state.nft.hasLoaded = true;
          })
        );
      } catch (error) {
        set(
          produce((state) => {
            state.nft.hasLoaded = true;
          })
        );
        console.error(error);
      }
    },

    setContract: async (provider: ethers.providers.Web3Provider | null, userAddress: string | null) => {
      try {
        const { address, abi } = CongressKittiesNFT;

        const provider2 = ethers.getDefaultProvider("ropsten", {
          etherscan: process.env.etherscan,
          infura: process.env.infura,
        });
        const contract = new ethers.Contract(address, abi, provider || provider2);

        set(
          produce((state) => {
            state.nft.userAddress = userAddress;
            state.nft.contract = contract;
          })
        );

        get().nft.loadContractData();
      } catch (error) {
        console.error(error);
      }
    },
    setSignerContract: async (signer: ethers.providers.JsonRpcSigner) => {
      const { address, abi } = CongressKittiesNFT;
      const contract = new ethers.Contract(address, abi, signer);

      set(
        produce((state) => {
          state.nft.signerContract = contract;
        })
      );
    },
  },
});

export default createNftSlice;
