import type { MocData, Party, State } from "constants/index";
import type { RespVote } from "services/api";

import * as React from "react";
import uniq from "lodash/uniq";
import styled from "styled-components";

import useStore from "store/useStore";
import { MOC_DATA, STATES } from "constants/index";
import Dropdown, { DropdownInput } from "components/SearchDropdown";
import CongressCard from "pages/CongressNftPage/components/CongressCard";
import FilterByState from "components/FilterByState";
import { useWallet } from "context/wallet";
import { color, device } from "styles/globalStyles";
import { IconButton } from "components/IconButton";
import { ReactComponent as CloseIcon } from "assets/images/close.svg";
import Items from "components/Item";
import { filterBySearchValue, filterByState } from "utils/filterCongressList";

export type StateValue = State | string;
export type PartyValue = Party | string;

export type Form = {
  id: number | null;
  comment: string;
};

export type Congress = MocData[] | (MocData[] & RespVote[]);

export const mocStates = uniq(MOC_DATA.map((d) => d.state)).map((stateAbbr) => stateAbbr as State);

const CongressNftPage: React.FC = () => {
  const searchByNameInputRef = React.useRef<HTMLInputElement>(null);
  const searchByStateInputRef = React.useRef<HTMLInputElement>(null);
  const congressListRef = React.useRef<HTMLUListElement>(null);
  const congress = useStore((state) => state.congress.congress);
  const congressLoaded = useStore((state) => state.congress.loaded);
  const congressLoading = useStore((state) => state.congress.loading);
  const contract = useStore((state) => state.nft.contract);
  const setSignerContract = useStore((state) => state.nft.setSignerContract);
  const headerHeight = useStore((state) => state.headerHeight);
  const selectedState = useStore((state) => state.congress.selectedState);
  const fetchCongress = useStore((state) => state.congress.fetchCongress);
  const setContract = useStore((state) => state.nft.setContract);
  const setSelectedState = useStore((state) => state.congress.setSelectedState);
  const { address, loaded: walletLoaded, provider, signer } = useWallet();
  const [stateSearchValue, setStateSearchValue] = React.useState<State | string>("");
  const [nameSearchValue, setNameSearchValue] = React.useState<string>("");

  // onMount
  React.useEffect(() => {
    if (!congressLoaded) {
      fetchCongress(address || "");
    }

    if (walletLoaded && !contract) {
      setContract(provider, address);
    }
  }, [address, congressLoaded, contract, fetchCongress, provider, setContract, walletLoaded]);

  React.useEffect(() => {
    if (signer) {
      setSignerContract(signer);
    }
  }, [setSignerContract, signer]);

  const congressSortedListOutput = React.useMemo(() => {
    let result = [...congress];

    result = filterBySearchValue(result, nameSearchValue, "name");
    result = filterByState(result, selectedState);
    result = filterBySearchValue(result, stateSearchValue, "fullState");

    return result;
  }, [congress, nameSearchValue, selectedState, stateSearchValue]);

  const handleStateClick = (userInput: State) => {
    if (userInput === selectedState) {
      setSelectedState("");
    } else {
      setSelectedState(userInput);
    }
  };

  return (
    <Wrapper headerHeight={headerHeight}>
      <header>
        <h1>PhatCats NFT Auction</h1>
      </header>

      <ContentWrapper>
        <Section>
          <Dropdown>
            <DropdownInput
              ref={searchByNameInputRef}
              placeholder="Search..."
              onChange={(e) => setNameSearchValue(e.target.value)}
            />
          </Dropdown>
          <Dropdown className="mobileDownOnly">
            <DropdownInput
              ref={searchByStateInputRef}
              placeholder="Search by state..."
              onChange={(e) => setStateSearchValue(e.target.value)}
            />
          </Dropdown>

          <div>
            {selectedState && (
              <IconButton
                style={{ margin: "0 1em" }}
                variant="contained"
                onClick={() => handleStateClick(selectedState as State)}
              >
                <span>{STATES[selectedState as State]}</span> <CloseIcon />
              </IconButton>
            )}
          </div>

          {(congressLoading || !congressLoaded) && <LoadingIcon>loading...</LoadingIcon>}

          <CongressList ref={congressListRef} headerHeight={headerHeight}>
            {!congressLoading &&
              congressSortedListOutput.map((c, i) => {
                return <CongressCard key={c.name} congress={c} />;
              })}
          </CongressList>
        </Section>
        <Aside>
          <FilterByState states={mocStates} handleClick={handleStateClick} />
        </Aside>
      </ContentWrapper>
    </Wrapper>
  );
};

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
  padding: 0.25em;

  @media ${device.laptop} {
    overflow-y: scroll;
    ${({ headerHeight }) => {
      if (headerHeight) {
        return `height: calc(100vh - ${headerHeight}px - 17em);`;
      }
    }}

    align-items: flex-start;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(186px, 1fr));
    grid-gap: 1em;
  }
`;

// grid-auto-flow: column;
//     li {
//       width: 300px;
//     }

const Aside = styled.aside`
  display: none;

  @media ${device.laptop} {
    display: block;
    max-width: 13rem;
    padding: 0 0 0 1em;

    border-left: 2px solid ${color.grayDark};
  }
`;

export default CongressNftPage;
