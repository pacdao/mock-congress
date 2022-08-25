import type { MocData, Party, State } from "constants/index";
import type { RespVote } from "services/api";

import * as React from "react";
import uniq from "lodash/uniq";
import styled from "styled-components";
import useStore from "store/useStore";
import { MOC_DATA, PAC_DAO_BASEURL, STATES } from "constants/index";
import SearchDropdown, { DropdownInput } from "components/SearchDropdown";
import Dropdown from "components/Dropdown";
import CongressCard from "pages/HomePage/components/CongressCard";
import FilterByState from "components/FilterByState";
import { useWallet } from "context/wallet";
import ScoreDefinition from "pages/HomePage/components/ScoreDefinition";
import CommentForm from "pages/HomePage/components/CommentForm";
import { color, device } from "styles/globalStyles";
import ExternalLink from "components/ExternalLink";
import Portal from "components/Portal";
import { IconButton } from "components/IconButton";
import { ReactComponent as CloseIcon } from "assets/images/close.svg";
import Items from "components/Item";
import { AiOutlineReload } from "react-icons/ai";
import ClipLoader from "react-spinners/ClipLoader";
import {
  filterBySearchValue,
  filterBySeat,
  filterByState,
  sortByAuctionState,
} from "utils/filterCongressList";
import { isDevelopment } from "utils";

import Button from "components/Button";
import { BigNumber, ethers } from "ethers";
export type StateValue = State | string;
export type PartyValue = Party | string;

export type Congress = MocData[] | (MocData[] & RespVote[]);

export const mocStates = uniq(MOC_DATA.map((d) => d.state)).map((stateAbbr) => stateAbbr as State);

export type Form = {
  id: number | null;
  comment: string;
};

const MAX_BATCH_MINT = 10;

const HomePage: React.FC = () => {
  const searchByNameInputRef = React.useRef<HTMLInputElement>(null);
  const searchByStateInputRef = React.useRef<HTMLInputElement>(null);
  const congressListRef = React.useRef<HTMLUListElement>(null);
  const congress = useStore((state) => state.congress.congress);
  const congressLoaded = useStore((state) => state.congress.loaded);
  const congressLoading = useStore((state) => state.congress.loading);
  const headerHeight = useStore((state) => state.headerHeight);
  const selectedState = useStore((state) => state.congress.selectedState);
  const fetchCongress = useStore((state) => state.congress.fetchCongress);
  const setContract = useStore((state) => state.nft.setContract);
  const loadContractData = useStore((state) => state.nft.loadContractData);
  const setSelectedState = useStore((state) => state.congress.setSelectedState);
  const contract = useStore((state) => state.nft.contract);
  const setSignerContract = useStore((state) => state.nft.setSignerContract);
  const seatWinners = useStore((state) => state.nft.seatWinners);
  const auctionStatuses = useStore((state) => state.nft.auctionStatuses);
  const redeemableBalances = useStore((state) => state.nft.redeemableBalances);

  const { address, haveWallet, loaded: walletLoaded, provider, signer } = useWallet();
  const signerContract = useStore((state) => state.nft.signerContract);
  const [stateSearchValue, setStateSearchValue] = React.useState<State | string>("");
  const [nameSearchValue, setNameSearchValue] = React.useState<string>("");
  const [seatSearchValue, setSeatSearchValue] = React.useState<string>("");
  const [form, setForm] = React.useState<Form>({ id: null, comment: "" });
  const [showModal, setShowModal] = React.useState(false);
  const [batchCount, setBatchCount] = React.useState("0");
  const [auctionStateOrder, setAuctionStateOrder] = React.useState(1);
  const [batchPrice, setBatchPrice] = React.useState("0");
  const [isLoadingBatchPrice, setIsLoadingBatchPrice] = React.useState(false);
  const [isFilteredUserNFT, setIsFilteredUserNFT] = React.useState(false);

  const seatSearchTag = React.useMemo(() => {
    if (seatSearchValue === "") return "";
    if (seatSearchValue === "SEN") return "Senator";
    return "District: " + seatSearchValue;
  }, [seatSearchValue]);

  const updateBatchCount = async (batchNum: number) => {
    if (!batchNum) {
      batchNum = 0;
    }
    if (batchNum.toString() === batchCount) {
      return;
    }
    if (batchNum === 0){
      setBatchCount(batchNum.toString());
      setBatchPrice("0");
      return;
    }
    batchNum = Math.min(batchNum, MAX_BATCH_MINT);
    try {
      if (signerContract && signer && batchNum !== undefined) {
        setBatchCount(batchNum.toString());
        setIsLoadingBatchPrice(true);
        const batchPrice: BigNumber = await signerContract.mint_batch_price(batchNum, address, { gasLimit: 10000000 });
        const parsedBatchPrice = ethers.utils.formatEther(batchPrice);
        setBatchPrice(parsedBatchPrice);
      } else {
        return;
      }
    } catch (error) {
      console.error(error);
    } 
    setIsLoadingBatchPrice(false);
  }

  const mintBatch = async (batchNum: number | undefined) => {
    try {
      if (signerContract && signer && batchNum !== undefined && batchPrice !== undefined) {
        const batchPrice: BigNumber = await signerContract.mint_batch_price(batchNum, address, { gasLimit: 10000000 });
        const value = batchPrice;
        console.log("---> initiate mint_batch with", value);
        const txResp = await signerContract.mint_batch(batchNum, { value });
        const { blockHash } = await txResp.wait();
        console.log("blockHash", blockHash);
      } else {
        throw new Error("Missing params signerContract or signer or batchNum or batchPrice");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const congressSortedListOutput = React.useMemo(() => {
    let result = [...congress];

    result = filterBySearchValue(result, nameSearchValue, "name");
    result = filterByState(result, selectedState);
    result = filterBySearchValue(result, stateSearchValue, "fullState"); // mobile view search by state
    result = filterBySeat(result, seatSearchValue);
    // result = sortByScore(result, scoreOrder);
    result = sortByAuctionState(result, auctionStatuses, auctionStateOrder);

    return result;
  }, [congress, nameSearchValue, auctionStateOrder, seatSearchValue, selectedState, stateSearchValue, auctionStatuses]);

  /**
   * input handlers
   */
  const handleResetSeatSearch = () => {
    setSeatSearchValue("");
  };

  const handleResetSelectedState = () => {
    setSelectedState("");
    handleResetSeatSearch();
  };

  const handleRedeem = async () => {
    if (signerContract && address) {
      await signerContract.redeem_missing(address, { gasLimit: 200000 });
    }
  };

  const handleStateClick = (userInput: State) => {
    if (isDevelopment) console.log("handleStateClick(userInput=" + userInput + ")");

    if (userInput === selectedState) {
      /* user has clicked the state that is currently being filtered, this removes the filter */
      handleResetSelectedState();
    } else {
      setSelectedState(userInput);
    }
  };

  const handleReload = () => {
    loadContractData();
  };

  const handleFilterOwnedNFT = () => {
    setIsFilteredUserNFT((prev) => !prev);
  };

  React.useEffect(() => {
    if (!congressLoaded) {
      fetchCongress(address || "");
    }
  }, [address, congressLoaded, fetchCongress]);

  React.useEffect(() => {
    if (walletLoaded && !contract) {
      setContract(provider, address);
    }
  }, [address, contract, provider, setContract, walletLoaded]);

  React.useEffect(() => {
    if (signer) {
      setSignerContract(signer);
    }
  }, [setSignerContract, signer]);

  React.useEffect(() => {
    async function setDefaultClaims() {
      await updateBatchCount(MAX_BATCH_MINT);
    }
    setDefaultClaims();
  }, [address, contract, provider, walletLoaded, signerContract, signer]);

  return (
    <Wrapper headerHeight={headerHeight}>
      <header>
        <h1>PhatCats</h1>
        <ExternalLink href={`${PAC_DAO_BASEURL}/phatcats`}>On-Chain Congressional Scorecard</ExternalLink>
      </header>

      <ContentWrapper>
        <Section>
          <SearchDropdown>
            <DropdownInput
              ref={searchByNameInputRef}
              placeholder="Search..."
              onChange={(e) => setNameSearchValue(e.target.value)}
            />
          </SearchDropdown>
          <SearchDropdown className="mobileDownOnly">
            <DropdownInput
              ref={searchByStateInputRef}
              placeholder="Search by state..."
              onChange={(e) => setStateSearchValue(e.target.value)}
            />
          </SearchDropdown>

          {haveWallet && <ScoreDefinition className="mobileDownOnly" />}

          <OptionsRow>
            <LeftContent>
              <Dropdown
                label="Sort By"
                data={[
                  { value: "1", label: "Live Auction" },
                  { value: "0", label: "Available NFT" },
                  { value: "2", label: "Owned NFT" },
                  { value: "3", label: "Low Score" },
                  { value: "4", label: "High Score" },
                ]}
                handleSelect={(e) => setAuctionStateOrder(parseInt(e))}
              />

              <IconButton variant="outlined" onClick={handleReload}>
                <AiOutlineReload />
              </IconButton>

              {Array.isArray(seatWinners) && seatWinners.length > 0 && (
                <IconButton variant={isFilteredUserNFT ? "contained" : "outlined"} onClick={handleFilterOwnedNFT}>
                  <span>Filter by your NFT</span>
                </IconButton>
              )}

              {selectedState && (
                <IconButton variant="contained" onClick={handleResetSelectedState}>
                  <span>{STATES[selectedState as State]}</span> <CloseIcon />
                </IconButton>
              )}
              {seatSearchTag && (
                <IconButton variant="contained" onClick={handleResetSeatSearch}>
                  <span>{seatSearchTag}</span> <CloseIcon />
                </IconButton>
              )}
            </LeftContent>
            <RightContent>
              {redeemableBalances && redeemableBalances !== "0.0" && (
                <div>
                  <span>Redeemable Balance: {redeemableBalances} ETH </span>
                  <Button variant="secondary" onClick={handleRedeem}>
                    Redeem
                  </Button>
                </div>
              )}
            </RightContent>
          </OptionsRow>

          {(congressLoading || !congressLoaded) && <LoadingIcon>loading...</LoadingIcon>}

          <CongressList ref={congressListRef} headerHeight={headerHeight}>
            {!congressLoading &&
              congressSortedListOutput.map((c, i) => {
                if (isFilteredUserNFT) {
                  if (seatWinners[c.id] === address) {
                    return (
                      <CongressCard
                        key={c.name}
                        isFirst={i === 0}
                        congress={c}
                        setForm={setForm}
                        setShowModal={setShowModal}
                        setSeatSearchValue={setSeatSearchValue}
                        setNameSearchValue={setNameSearchValue}
                      />
                    );
                  }
                  return null;
                }
                return (
                  <CongressCard
                    key={c.name}
                    isFirst={i === 0}
                    congress={c}
                    setForm={setForm}
                    setShowModal={setShowModal}
                    setSeatSearchValue={setSeatSearchValue}
                    setNameSearchValue={setNameSearchValue}
                  />
                );
              })}
          </CongressList>
        </Section>

        <Aside>
          <MintNftWrapper>
            <MintNftHeader>Mint is Live!</MintNftHeader>
            <ul>
              <li><a target="_blank" href="https://etherscan.io/address/0x54FFC76838E79E7Fd9aA52FbDC49F2671743d305">Etherscan</a></li>
              <li><a target="_blank" href="https://opensea.io/collection/pac-dao-phatcat">Open Sea</a></li>
              <li><a target="_blank" href="https://github.com/pacdao/mock-congress/">Github</a></li>
            </ul>
            <p>
              Start an auction on any unclaimed Kitty, or claim a random batch here. <a href="https://pacdao.substack.com/p/f830af92-378c-450a-bf97-ecc7ed757fa5">Details</a>
            </p>
            <hr />
            Quantity{" "}
            <input
              id="batchCount"
              onChange={(e) => updateBatchCount( parseInt(e.target.value.replace(/[^0-9]/g, '')) )}
              value={batchCount}
              disabled={isLoadingBatchPrice}
              style={{ width: "100px", color: "#000000", marginBottom: "0.5em" }}
            />
            <br />
            {isLoadingBatchPrice && <ClipLoader color="#ffffff" loading={isLoadingBatchPrice} size={10}/>}
            {!isLoadingBatchPrice && (<span id="compute">Cost: {batchPrice} ETH</span>)}
            <MintNftButton onClick={() => mintBatch(Number(batchCount))} variant="secondary" disabled={isLoadingBatchPrice || Number(batchCount)===0}>
              Claim Pack
            </MintNftButton>
          </MintNftWrapper>

          <StateSelectionWrapper>
            {haveWallet && <ScoreDefinition className="!mobileDownOnly" />}
            <FilterByState states={mocStates} handleClick={handleStateClick} />
          </StateSelectionWrapper>
        </Aside>
      </ContentWrapper>

      <Portal>
        <CommentForm form={form} setForm={setForm} showModal={showModal} setShowModal={setShowModal} />
      </Portal>
    </Wrapper>
  );
};

const MintNftButton = styled(Button)`
  margin-top: 0.5rem;
  width: 100%;
`;

const MintNftHeader = styled.header`
  padding: 0.25rem;

  background-color: #ffff00;
  font-weight: bold;
  text-align: center;
  color: black !important;
`;

const MintNftWrapper = styled.div`
  padding: 0.25rem;

  p {
    padding: 0;
    margin: 0.25rem;
    font-size: 0.9rem;
  }

  border: 1px solid hsl(0 0% 67% / 1);
`;

const StateSelectionWrapper = styled.div`
  margin-top: 2rem;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

type WrapperProps = {
  headerHeight: number | null;
};

const Wrapper = styled.div<WrapperProps>`
  @media ${device.laptop} {
    ${({ headerHeight }) => {
      if (headerHeight) {
        return `
          height: calc(100vh - ${headerHeight}px - 3em);
        `;
      }
    }}
    overflow: hidden;
  }
`;

const Section = styled.div`
  flex-grow: 1;
  padding: 1em;
  padding-left: 0;
`;

const LoadingIcon = styled.p`
  width: 100%;
  text-align: center;
`;

type CongressListProps = {
  headerHeight: number | null;
};

const CongressList = styled(Items)<CongressListProps>`
  margin-top: 1em;

  @media ${device.laptop} {
    overflow-y: scroll;
    ${({ headerHeight }) => {
      if (headerHeight) {
        return `
          height: calc(100vh - ${headerHeight}px - 17em);
        `;
      }
    }}
  }
`;

const Aside = styled.aside`
  display: none;

  @media ${device.laptop} {
    display: block;
    max-width: 13rem;
    padding: 0 0 0 1em;

    border-left: 2px solid ${color.grayDark};
  }
`;

const OptionsRow = styled.div`
  display: flex;
  flex-direction: row;

  padding: 0.25em;
`;

const LeftContent = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 1rem;
`;
const RightContent = styled.div`
  margin-right: 1em;
  align-items: flex-end;
  justify-content: flex-end;
  display: flex;
  flex-grow: 1;
`;

export default HomePage;
