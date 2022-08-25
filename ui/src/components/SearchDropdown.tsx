import styled from "styled-components";

import { color } from "styles/globalStyles";

/* The search field */
export const DropdownInput = styled.input`
  padding: 1em;
  width: 100%;

  font-size: 1rem;

  background-color: transparent;
  border: 3px solid ${color.gray};
  border-radius: 8px;
  outline: none;

  :hover,
  :active {
    background-color: ${color.yellowA1};
    border-color: ${color.yellow};
  }
`;


const SearchDropdown = styled.div`
  position: relative;
  margin-bottom: 1em;
`;

export default SearchDropdown;
