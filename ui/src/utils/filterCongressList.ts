import type { State } from "constants/index";
import type { RespVote } from "services/api";

import FuzzySearch from "fuzzy-search";
import sortBy from "lodash/sortBy";

type SelectedState = State | string;

export const filterByState = (congressList: RespVote[], selectedState: SelectedState) => {
  if (!selectedState) return congressList;
  return congressList.filter((c) => c.state === selectedState);
};

export const filterBySeat = (congressList: RespVote[], seatSearchValue: string) => {
  if (!seatSearchValue) return congressList;
  return congressList.filter((c) => c.seat === seatSearchValue);
};

const fuzzySearch = (list: RespVote[], keys?: string[], searchValue?: string) => {
  const options = { sort: true };
  const searcher = new FuzzySearch(list, keys, options);
  return searcher.search(searchValue);
};

export const filterBySearchValue = (congressList: RespVote[], searchValue: string, searchKey: string) => {
  if (!searchValue) return congressList;
  return fuzzySearch(congressList, [searchKey], searchValue);
};

export const sortByScore = (congressList: RespVote[], score?: number) => {
  if (score === 1) {
    // sort by overall score
    return sortBy(congressList, ["overall_score"]);
  } else if (score === -1) {
    // sort by over score reversed
    return sortBy(congressList, ["overall_score"]).reverse();
  }

  // default:  sort by recognition reversed
  return sortBy(congressList, "recognition").reverse();
};

export const sortByAuctionState = (congressList: RespVote[], auctionStatuses: number[], auctionStatusOrder?: number) => {

  switch (auctionStatusOrder) {
    case 0:
      return sortBy(congressList, (o) => auctionStatuses[o.id] === 0 ? 0 : 1);
    case 2:
      return sortBy(congressList, (o) => auctionStatuses[o.id] === 2 ? 0 : 1);
    case 3:
      return sortBy(congressList, ["overall_score"]);
    case 4:
      return sortBy(congressList, ["overall_score"]).reverse();
    default:
      return sortBy(congressList, (o) => auctionStatuses[o.id] === 1 ? 0 : 1);
  }
};
