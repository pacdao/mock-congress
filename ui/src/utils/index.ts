import type { State } from "constants/index";

import { STATES } from "constants/index";

export enum AuctionStates {
  NOT_STARTED = 0,
  LIVE,
  ENDED,
}

export const shortenAddress = (address: string) => {
  return `${address.substring(0,7)}...${address.substring(address.length - 7)}`;
}

export function lowercaseAndHyphenateString(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export function senatorRepresentativeDescription(seat: string, state: State) {
  if (seat === "SEN") {
    return `Senator from ${STATES[state]}`;
  } else {
    return `Representative (${state} - ${seat})`;
  }
}

export function keepFirstDecimal(s: string) {
  return s.split('').reverse().join('').replace(/[^-?0-9.]|\.(?=.*\.)/g, '').split('').reverse().join('');
};

export function getNumPlacesAfterDecimal(s: string) {
  let decimalLocation = s.indexOf(".");
  return s.substring(decimalLocation).length - 1;
}

export function setLeadingZeroAndKeepFirstDecimal(s: string, numPlacesAfterDecimal = 3) {
  let modS = keepFirstDecimal(s);
  if (modS[0] === ".") {
    modS = "0" + modS;
  }
  
  let decimalLocation = modS.indexOf(".");
  let maxStrLen = Math.min(modS.length, (decimalLocation+numPlacesAfterDecimal+1));
  return modS.substring(0, maxStrLen);
};

export const isDevelopment = process.env.REACT_APP_NODE_ENV === "development";
console.log(`dev: ${isDevelopment}`);