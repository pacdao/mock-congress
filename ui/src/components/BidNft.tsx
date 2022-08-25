import type { RespVote } from "services/api";

import { ethers } from "ethers";
import * as React from "react";
import styled from "styled-components";

import {
  shortenAddress,
  setLeadingZeroAndKeepFirstDecimal,
  getNumPlacesAfterDecimal,
  AuctionStates,
  isDevelopment,
} from "utils";

import { useWallet } from "context/wallet";
import { color } from "styles/globalStyles";
import useStore from "store/useStore";
import Button from "components/Button";

interface Props {
  congress: RespVote;
}

const BidNft = ({ congress }: Props) => {
  const { address, signer } = useWallet();
  const auctionMaxBids = useStore((state) => state.nft.auctionMaxBids);
  const userBids = useStore((state) => state.nft.userBids);
  const auctionDeadlines = useStore((state) => state.nft.auctionDeadlines);
  const auctionStatuses = useStore((state) => state.nft.auctionStatuses);
  const seatWinners = useStore((state) => state.nft.seatWinners);
  const seatsMinted = useStore((state) => state.nft.seatsMinted);
  const signerContract = useStore((state) => state.nft.signerContract);
  const loadContractData = useStore((state) => state.nft.loadContractData);
  const minPrice = useStore((state) => state.nft.minPrice);
  const minBidIncrement = useStore((state) => state.nft.minBidIncrement);
  const minBidIncrementString = useStore((state) => state.nft.minBidIncrementString);

  const [bidValue, setBidValue] = React.useState("");
  const [isBidding, setIsBidding] = React.useState(false);
  const [bidCompletedHash, setBidCompletedHash] = React.useState("");

  const bidCompletedHashUrl = React.useMemo(() => {
    if (bidCompletedHash) {
      const path = isDevelopment ? `https://rinkeby.etherscan.io/tx/` : `https://etherscan.io/`;
      return `${path}${bidCompletedHash}`;
    }
  }, [bidCompletedHash]);

  const canBeginAuction = React.useMemo(() => {
    return auctionStatuses[congress.id] === AuctionStates.NOT_STARTED;
  }, [auctionStatuses, congress.id]);

  const isAuctionLive = React.useMemo(() => {
    return auctionStatuses[congress.id] === AuctionStates.LIVE;
  }, [auctionStatuses, congress.id]);

  const hasAuctionEnded = React.useMemo(() => {
    return auctionStatuses[congress.id] === AuctionStates.ENDED;
  }, [auctionStatuses, congress.id]);

  const hasAuctionBid = React.useMemo(() => {
    const userBid = userBids[congress.id] ? userBids[congress.id] : "0.0";
    return !ethers.utils.parseEther(userBid).isZero();
  }, [userBids, congress.id]);

  const isAuctionWinner = React.useMemo(() => {
    return userBids[congress.id] === auctionMaxBids[congress.id];
  }, [userBids, auctionMaxBids, congress.id]);

  const getMinBid = React.useMemo(() => {
    if (hasAuctionBid) {
      return minBidIncrement;
    }
    
    return minPrice;
  }, [userBids, auctionMaxBids, congress.id]);

  const canBid = (bidAmount: string) => {
    return getMinBid.lte(ethers.utils.parseEther(bidAmount));
  };

  const mintSeat = async () => {
    if (signerContract && signer) {
      try {
        const txResp = await signerContract.generate_mint(congress.id, { gasLimit: 500000 });
        const { blockHash } = await txResp.wait();
        console.log("blockHash", blockHash);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const startBid = async (bidAmount: string) => {
    if (signerContract && signer) {
      try {
        setBidCompletedHash("");

        if (!canBid(bidAmount)) {
          return;
        }

        setIsBidding(true);
        const parsedBidEth = ethers.utils.parseUnits(bidAmount, "ether");
        console.log("final Bid Price", parsedBidEth.toString());
        const options = { value: parsedBidEth.toString() };
        const txResp = await signerContract.auction_bid(congress.id, options);
        const { blockHash } = await txResp.wait();
        console.log("bockHash", blockHash);
        await loadContractData(true);

        setBidCompletedHash(blockHash);
        setBidValue("");
        setIsBidding(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getSeatOwner = () => {
    const ownerAddr = seatWinners[congress.id];
    return ownerAddr === address ? "YOU!!!" : shortenAddress(ownerAddr);
  };

  

  const numPlacesAfterDecimal = getNumPlacesAfterDecimal(minBidIncrementString);

  return (
    <>
      {(canBeginAuction || isAuctionLive) && (
        <StyledBidWrapper haveAuctionData={isAuctionLive}>
          <input
            id="bidValue"
            placeholder={`min. ${ethers.utils.formatEther(getMinBid)} ETH`}
            style={{ width: "150px", color: "#000000", marginRight: "1em" }}
            pattern="([0-9]+([.][0-9]*)?|[.][0-9]+)"
            onChange={(e) => {
              // let newVal = e.target.value.replace(/[^0-9.]|\.(?=.*\.)/g,'');
              setBidValue(setLeadingZeroAndKeepFirstDecimal(e.target.value, numPlacesAfterDecimal));
            }}
            value={bidValue}
          />
          <Button
            disabled={!bidValue || !canBid(bidValue) || isBidding}
            isLoading={isBidding}
            onClick={() => startBid(bidValue)}
          >
            {canBeginAuction ? "Begin Auction" : "Add Bid"}
          </Button>
        </StyledBidWrapper>
      )}
      {!!bidCompletedHashUrl && (
        <SuccessWrapper>
          <span>
            Success!{" "}
            <a href={bidCompletedHashUrl} target="_blank" rel="noreferrer">
              View transaction
            </a>
          </span>{" "}
          <Button onClick={() => setBidCompletedHash("")}>X</Button>
        </SuccessWrapper>
      )}
      <>
        {isAuctionLive && (
          <StyledAuctionInfoWrapper>
            <li>
              Top Bid: {auctionMaxBids[congress.id]} ETH | Your: {userBids[congress.id]} ETH
            </li>
            {isAuctionLive && <li>Auction Leader: {getSeatOwner()}</li>}
            <li>
              Deadline:{" "}
              {new Intl.DateTimeFormat("en-GB", {
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              }).format(1000 * auctionDeadlines[congress.id])}
            </li>
          </StyledAuctionInfoWrapper>
        )}

        {hasAuctionEnded && (
          <div>
            <p>
              Owner: {getSeatOwner()}
              {isAuctionWinner && !seatsMinted[congress.id] && (
                <Button style={{ marginLeft: "1em" }} onClick={() => mintSeat()} variant="cta">
                  Mint
                </Button>
              )}
            </p>
            <p>{hasAuctionBid && !isAuctionWinner ? "Didn't make it for this one mate :(" : ""}</p>
          </div>
        )}
      </>
    </>
  );
};

const SuccessWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  max-width: 200px;
  padding: 0.5rem;
  background-color: ${color.success};

  > button {
    margin-left: 1rem;
  }
`;

const StyledBidWrapper = styled.div<{ haveAuctionData: boolean }>`
  display: flex;

  ${({ haveAuctionData }) => {
    if (haveAuctionData) {
      return `margin-top: 0.5rem;`;
    }
  }}
`;

const StyledAuctionInfoWrapper = styled.ul`
  list-style: none;
  line-height: 1.3;
  padding: 0;
  margin: 0;
  margin-top: 1rem;
`;

export default BidNft;
