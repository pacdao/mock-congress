import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { color } from "styles/globalStyles";
import { RespVote } from "services/api";
import { useWallet } from "context/wallet";
import Button from "components/Button";
import { lowercaseAndHyphenateString } from "utils";
import useStore from "store/useStore";

interface Props {
  congress: RespVote;
}

// TODO:
// - UI Card cleanup.
// - Loading state when bid is placed.

export const CongressCard = ({ congress }: Props) => {
  const { signer } = useWallet();
  const minPrice = useStore((state) => state.nft.minPrice);
  const auctionStatuses = useStore((state) => state.nft.auctionStatuses);
  const signerContract = useStore((state) => state.nft.signerContract);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [vote, setVote] = React.useState<number | null>(congress.vote);

  React.useEffect(() => {
    if (congress?.vote && !vote) {
      setVote(congress?.vote);
    }
  }, [vote, congress?.vote]);

  const congressPageLink = `/${lowercaseAndHyphenateString(congress.name)}`;

  const isAuctionLive = React.useMemo(() => {
    const auction = auctionStatuses[congress.id];
    return typeof auction !== "undefined" && auction !== 0;
  }, [auctionStatuses, congress.id]);

  const startBid = async (bidPrice: string) => {
    if (signerContract && signer) {
      try {
        console.log("minPrice", minPrice.toString());

        // const eth = parseUnits(bidPrice, "ethers");
        // console.log("eth", eth);
        // const wei = formatUnits(eth, "wei");
        const options = { value: minPrice.toString() };
        const txResp = await signerContract.auction_start(congress.id, options);
        const { blockHash } = await txResp.wait();
        console.log("blockHash", blockHash);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Item key={congress.id}>
      <Content>
        <ImgWrapper>
          <Img
            ref={imageRef}
            src={congress.mockups[0]}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = "/images/logo-triangle.png";
            }}
            alt={congress.name}
          />
        </ImgWrapper>

        <DescriptionWrapper>
          <Title>
            <Link to={congressPageLink}>{congress.name}</Link>
          </Title>

          {/* TODO: Auction styling need to be updated */}
          <p>Auction {isAuctionLive ? "true" : "false"} </p>

          <Button onClick={() => startBid("1")} variant="secondary">
            Bid NFT
          </Button>
        </DescriptionWrapper>
      </Content>
    </Item>
  );
};

const Item = styled.li``;

const Content = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

  color: white;
  background: ${color.yellow05};
`;

const ImgWrapper = styled.div`
  padding: 0.5rem;

  background-repeat: no-repeat;
  background-position: 50% 0;
  background-size: cover;
`;

const Img = styled.img`
  height: auto;
  width: 100%;

  // box-shadow: 0 0 1.5rem rgb(17 17 17 / 70%);

  transition: all 0.2s ease-in-out;

  :hover {
    transform: scale(1.1);
  }
`;

const DescriptionWrapper = styled.div`
  padding: 0.5rem 0;
  text-align: center;
`;

const Title = styled.div``;

export default React.memo(CongressCard);
