import type { State } from "constants/index";

import styled from "styled-components";

import { STATES } from "constants/index";
import { color, device } from "styles/globalStyles";
import useStore from "store/useStore";

type Props = {
  states: State[];
  handleClick: (state: State) => void;
};

const FilterByState = ({ states, handleClick }: Props) => {
  const selectedState = useStore((state) => state.congress.selectedState);
  return (
    <Section>
      <Header>Filter by states</Header>
      <StatesList>
        {states.map((state) => {
          return (
            <Item data-active={selectedState === state} key={state} onClick={() => handleClick(state)}>
              {STATES[state]}
            </Item>
          );
        })}
      </StatesList>
    </Section>
  );
};

const Section = styled.section`
  display: none;

  @media ${device.laptop} {
    display: block;
  }
`;

const Header = styled.header`
  text-transform: uppercase;
`;

const StatesList = styled.ul`
  height: calc(100vh - 304px);
  margin: 0;
  margin-top: 1em;
  overflow-y: scroll;
  padding: 0;

  color: ${color.gray};

  list-style: none;
`;

const Item = styled.li`
  padding: 0.25em;

  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  cursor: pointer;

  :hover,
  &[data-active="true"] {
    color: ${color.black};
    background-color: ${color.yellow};
  }
`;

export default FilterByState;
