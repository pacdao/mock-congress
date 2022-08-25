import type { Party } from "constants/index";
import type { Form } from "pages/HomePage";

import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { PARTIES } from "constants/index";
import { color, device } from "styles/globalStyles";
import { RespVote } from "services/api";
import Button from "components/Button";

import ClipLoader from "react-spinners/ClipLoader";

import { lowercaseAndHyphenateString, senatorRepresentativeDescription } from "utils";
import useStore from "store/useStore";
import BidNft from "components/BidNft";

interface Props {
  congress: RespVote;
  isFirst: boolean;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSeatSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setNameSearchValue: React.Dispatch<React.SetStateAction<string>>;
}

export const CongressCard = ({
  congress,
  isFirst,
  setForm,
  setShowModal,
  setSeatSearchValue,
  setNameSearchValue,
}: Props) => {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const hasLoaded = useStore((state) => state.nft.hasLoaded);
  const setSelectedState = useStore((state) => state.congress.setSelectedState);

  const [vote, setVote] = React.useState<number | null>(congress.vote);

  const handleViewRace = () => {
    setNameSearchValue("");
    setSelectedState(congress.state);
    setSeatSearchValue(congress.seat);
  };

  React.useEffect(() => {
    if (congress?.vote && !vote) {
      setVote(congress?.vote);
    }
  }, [vote, congress?.vote]);

  const incumbentDesc = congress.incumbent ? "Incumbent" : "Challenger";
  const congressPageLink = `/${lowercaseAndHyphenateString(congress.name)}`;

  return (
    <Item key={congress.id}>
      <LeftContent>
        <ImgWrapper>
          <Link to={congressPageLink}>
            <Img
              ref={imageRef}
              src={`https://ipfs.io/ipfs/${congress?.ipfs_img}`}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = "/images/logo-triangle.png";
              }}
              alt={congress.name}
              loading="lazy"
            />
          </Link>
        </ImgWrapper>

        <ImgWrapper>
          <Link to={congressPageLink}>
            <Img
              ref={imageRef}
              src={congress.img}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = "/images/logo-triangle.png";
              }}
              alt={congress.name}
              loading="lazy"
            />
          </Link>
        </ImgWrapper>
        <DescriptionWrapper>
          <Title>
            <Link to={congressPageLink}>{congress.name}</Link>
          </Title>
          <Description>
            <span>{senatorRepresentativeDescription(congress.seat, congress.state)}</span>
          </Description>
          <Description>
            {PARTIES[congress.party as Party]} | {incumbentDesc}{" "}
            <Button variant="text" onClick={handleViewRace}>
              view race
            </Button>
          </Description>
          <OtherDescription>
            <span>Score: {congress.overall_score}</span>
            <span>&#x1F5F3;&#xFE0F; {congress.total_votes}</span>
            <span>&#x1F4AC; {congress.comment_count}</span>
            <span>&#127912; {congress.mockup_vote_count}</span>
          </OtherDescription>
        </DescriptionWrapper>
      </LeftContent>
      <InteractiveContent>
        <div>
          <p>{hasLoaded}</p>
          <ClipLoader color="#ffffff" loading={!hasLoaded} />
        </div>
        <div>{hasLoaded && congress && <BidNft congress={congress} />}</div>
      </InteractiveContent>
    </Item>
  );
};

const Item = styled.li`
  display: flex;
  flex-direction: column;

  padding: 0.25em;
  border-bottom: 1px solid ${color.grayDark};

  > * {
    padding: 0.5em 0;
  }

  @media ${device.tablet} {
    align-items: center;
    flex-direction: row;

    > * {
      padding: 0.25em 0;
    }
  }
`;

const LeftContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
`;
const InteractiveContent = styled.div`
  margin-right: 1em;
  align-items: center;
  justify-content: center;
  display: flex;
  flex: 1;
`;

const ImgWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-right: 0.25em;
  height: 69px;
  width: 54px;
`;

const Img = styled.img`
  overflow: hidden;
  height: 100%;
  width: auto;
  max-width: 55.2px;
  height: 69px;
`;

const DescriptionWrapper = styled.div`
  margin-left: 0.25em;
`;

const Title = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
`;

const Description = styled.div`
  margin-top: 0.1em;

  font-size: 0.8rem;
  font-weight: 300;

  span {
    font-weight: 400;
  }
`;

const OtherDescription = styled(Description)`
  span {
    margin-right: 0.5rem;
  }
`;

export default React.memo(CongressCard);
