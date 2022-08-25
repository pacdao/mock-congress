import type { Party } from "constants/index";
import type { 
  CongressComment,
  RespVote, 
  VoteHistory,
} from "services/api";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import ClipLoader from "react-spinners/ClipLoader";

import { PARTIES } from "constants/index";
import { lowercaseAndHyphenateString, senatorRepresentativeDescription, shortenAddress } from "utils";
import { getCongressComments, getCongressVotesHistory, getVotes } from "services/api";
import { useWallet } from "context/wallet";
import { device } from "styles/globalStyles";
import VoteHistoryChart from "pages/CongressPage/components/VoteHistoryChart";
import Button from "components/Button";
import BidNft from "components/BidNft";

export type ScoreSupporters = {
  score: string;
  addresses: string[];
};

export type VoteHistoryData = { [key: string]: VoteHistory[] };
export const DEFAULT_SCORE_SUPPORTERS: ScoreSupporters = { score: "", addresses: [] };

const CongressPage = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const { congressName } = useParams();
  const navigate = useNavigate();
  const { address } = useWallet();

  const [loading, setLoading] = useState(false);
  const [congress, setCongress] = useState<RespVote | null>(null);
  const [voteHistory, setVoteHistory] = useState<VoteHistoryData | null>(null);
  const [comments, setComments] = useState<CongressComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [challengers, setChallengers] = useState<RespVote[]>([]);
  const [scoreSupporters, setScoreSupporters] = useState(DEFAULT_SCORE_SUPPORTERS);

  useEffect(() => {
    if (!congressName) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedCongresses = await getVotes();
        const foundCongress = fetchedCongresses?.find((c) => lowercaseAndHyphenateString(c.name) === congressName);

        if (foundCongress) {
          setCongress(foundCongress);
          const foundChallengers = fetchedCongresses
            .filter((c) => {
              return c.state === foundCongress.state && c.seat === foundCongress.seat;
            })
            .filter((c) => c.name !== foundCongress.name)
            .filter((c) => c.seat !== "SEN");

          setChallengers(foundChallengers);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Unable to find congress");
        setLoading(false);
      }
    })();
  }, [address, congressName]);

  useEffect(() => {
    if (!congress?.id) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [fetchedVoteHistory, fetchedComments] = await Promise.all([
          getCongressVotesHistory(congress.id),
          getCongressComments(congress.id),
        ]);
        if (fetchedVoteHistory) setVoteHistory(fetchedVoteHistory);
        if (fetchedComments) setComments(fetchedComments);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Unable to get community scores and comments");
        setLoading(false);
      }
    })();
    return () => {};
  }, [congress?.id]);

  if (!loading && !congress) {
    return <p>Unable to find {congressName}</p>;
  }

  if (!loading && error) {
    return <p>{error}</p>;
  }

  const haveChallengers = !!challengers.length;

  return (
    <Container>
      <Breadcrumb>
        <Button onClick={() => navigate(-1)}>back</Button>
      </Breadcrumb>
      <Wrapper>
        <Header>
          <ImgWrapper>
            <Img
              ref={imageRef}
              src={congress?.img}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = "/images/logo-triangle.png";
              }}
              alt={congress?.name}
              loading="lazy"
            />
          </ImgWrapper>
          <div>
            <h1>{congress?.name}</h1>
            <div>
              {congress?.seat && congress?.state && senatorRepresentativeDescription(congress.seat, congress.state)}
            </div>
            <div>
              {PARTIES[congress?.party as Party]} | {congress?.incumbent ? "Incumbent" : "Challenger"}
            </div>
            <div>Score: {congress?.overall_score}</div>
          </div>

          {haveChallengers && (
            <>
              <h3>Challengers</h3>
              {challengers.map((c) => {
                return (
                  <div key={c.name}>
                    <ImgWrapper>
                      <Img
                        key={c.name}
                        ref={imageRef}
                        src={c.img}
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null;
                          currentTarget.src = "/images/logo-triangle.png";
                        }}
                        alt={c.name}
                      />
                    </ImgWrapper>
                    <div>
                      <h1>{c.name}</h1>
                      <div>{c.seat && c.state && senatorRepresentativeDescription(c.seat, c.state)}</div>
                      <div>{PARTIES[c.party as Party]}</div>
                      <div>Score: {c.overall_score}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Header>

        <Content>
          <Section>
            <h2>NFT Auction</h2>
            {loading && <ClipLoader color="#ffffff" loading={loading} size={50}/>}
            {!loading && 
              <img
                style={{ width: "300px", height: "400px"}}
                alt='NFT'
                src={`https://ipfs.io/ipfs/${congress?.ipfs_img}`} />
            }
            {congress && <BidNft congress={congress} />}
          </Section>
          {/* <Section>
            <h2>Scores and comments from community</h2>
            <VoteHistoryChart data={voteHistory} setScoreSupporters={setScoreSupporters} />
          </Section>

          <Section>
            {Array.isArray(comments) && (
              <ul>
                {comments.map((c) => {
                  return (
                    <Comment key={c.date_created}>
                      <div>{c.comment}</div>
                      <div className="address">{shortenAddress(c.address)}</div>
                    </Comment>
                  );
                })}
              </ul>
            )}
          </Section> */}

          {/* NFT */}
          {/* {address && (
            <NFTSection>
              <h2>Vote for your favorite version</h2>
              <StyledItems>
                {congress?.mockups.map((m, idx) => {
                  const vote = idx + 1;
                  return (
                    <StyledItem className={nftVoted !== null ? "voted" : ""}>
                      <img src={m} alt={`mockup version ${vote}`} width="100%" height="100%" />
                      <ImageSelection>
                        {nftVoted === null ? (
                          <Button
                            onClick={() => {
                              handleVoteClick({ url: m, address, vote });
                              setNftVoted(idx);
                            }}
                          >
                            Vote
                          </Button>
                        ) : nftVoted === idx ? (
                          <Button disabled>Voted!</Button>
                        ) : null}
                      </ImageSelection>
                    </StyledItem>
                  );
                })}
              </StyledItems>
            </NFTSection>
          )} */}
        </Content>

        {scoreSupporters.score && (
          <Aside>
            <h3>Supporters for {scoreSupporters.score}</h3>
            <ul>
              {scoreSupporters.addresses.map((a) => {
                return <li>{shortenAddress(a)}</li>;
              })}
            </ul>
          </Aside>
        )}
      </Wrapper>
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  padding: 1rem;
`;

const Wrapper = styled.div`
  h1 {
    font-size: 1.5rem;
  }

  @media ${device.laptop} {
    display: grid;
    width: 100%;

    grid-template-columns: 250px auto 250px;
    grid-column-gap: 1rem;
  }
`;

const Header = styled.header``;

const Section = styled.section`
  margin-bottom: 1rem;
`;

const Content = styled.div`
  padding-bottom: 5rem;
`;

const Comment = styled.li`
  margin-top: 1rem;
  font-size: 0.875rem;

  .address {
    padding-top: 0.438rem;
    font-size: 0.625rem;
  }
`;

const Aside = styled.aside``;

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

  filter: sepia(1) grayscale(70%);
`;

const Breadcrumb = styled.div`
  margin-bottom: 1rem;
`;

export default CongressPage;
