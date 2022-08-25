import axios from "axios";
import groupBy from "lodash/groupBy";

import { State, STATES } from "constants/index";

export interface RespVote {
  auction_status: number;
  comment_count: number;
  mockup_vote_count: number;
  dnaString: string;
  fullState: string;
  gender: string;
  id: number;
  img: string;
  incumbent: boolean;
  ipfs_img: string,
  thumbnails: string[];
  mockups: string[];
  name: string;
  nft_address: string;
  overall_score: number;
  party: string;
  recognition: number;
  seat: string;
  state: State;
  total_votes: number;
  vote: number;
  vote_count: number;
  midsizeImage: string;
};
export interface SeatIPFSMetadata {
  description: string,
  external_url: string,
  image: string,
  name: string,
  attributes: [],
};

export type Voted = {
  [key: number]: RespVote;
};

const api = axios.create({
  baseURL: "https://curvemarketcap.com/",
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

const ipfsAPI = axios.create({
  baseURL: "https://ipfs.io/ipfs/bafybeiaederqghtf33jdj4rkx237mhgma7blcbibwm2ejzactuw2zjhl6q",
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


type GetVotePayload = {
  id: number;
  address?: string;
};

export type Vote = {
  score: number | null;
  count: number | null;
  address: string;
  vote: number;
};

export async function getVote({ id, address }: GetVotePayload) {
  try {
    const params = { id, address };
    const { data }: { data: Vote } = await api.get("/get_moc", { params });
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getVotes() {
  try {
    const { data }: { data: Voted } = await ipfsAPI.get("/");

    const parsed = Object.entries(data).map(([, v]) => {
      v.fullState = STATES[v.state];
      return v;
    });

    return parsed;
  } catch (error) {
    throw error;
  }
}

export async function getSeatIPFSData(link: string) {
  try {
    const { data }: { data: SeatIPFSMetadata} = await axios.get(link);
    return data;
  } catch (error) {
    throw error;
  }
}

export type VoteHistory = {
  address: string;
  vote: number;
  date_created: string;
  date_updated: string;
};

type VoteHistoryData = {
  [key: string]: VoteHistory;
};

export async function getCongressVotesHistory(id: number): Promise<{ [key: string]: VoteHistory[] }> {
  try {
    const params = { id };
    const { data }: { data: VoteHistoryData } = await api.get("/get_vote_history", { params });
    const parsed = groupBy(data, "vote");
    return parsed;
  } catch (error) {
    throw error;
  }
}

export type CongressComment = {
  address: string;
  comment: string;
  date_created: string;
};

type CongressCommentResp = {
  [key: string]: CongressComment;
};

export async function getCongressComments(id: number): Promise<CongressComment[]> {
  try {
    const params = { id };
    const { data }: { data: CongressCommentResp } = await api.get("/get_comments", { params });
    const parsed = data ? Object.keys(data).map((k) => data[k]) : [];
    return parsed;
  } catch (error) {
    throw error;
  }
}

type VotePayload = {
  id: number;
  address: string;
  vote: number;
};

export async function postVote({ id, address, vote }: VotePayload) {
  try {
    const params = { id, address, vote };
    const response = await api.get("/set_moc", { params });
    return response;
  } catch (error) {
    throw error;
  }
}

type PostCommentPayload = {
  id: number;
  address: string;
  comment: string;
};

export async function postComment({ id, address, comment }: PostCommentPayload) {
  try {
    const params = { id, address, comment };
    await api.get("/set_congress_note", { params });
  } catch (error) {
    throw error;
  }
}

export type PostKittyVotePayload = {
  url: string;
  address: string;
  vote: number;
};

export async function postKittyVote({ url, address, vote }: PostKittyVotePayload) {
  try {
    const params = { url, address, vote };
    await api.get("/set_kitty_vote", { params });
  } catch (error) {
    throw error;
  }
}
