import * as React from "react";
import styled from "styled-components";

import { ButtonBaseStyles } from "components/Button";
import { color } from "styles/globalStyles";

type Props = {
  label: string;
  data: { value: string; label: string }[];
  handleSelect: (selectedValue: string) => void;
};

const Dropdown = ({ label, data, handleSelect }: Props) => {
  return (
    <DropdownWrapper className="dropdown">
      <Button className="dropbtn">{label}</Button>
      <DropdownContent className="dropdown-content">
        {data.map((d) => {
          return (
            <DropdownContentItem key={d.value} onClick={() => handleSelect(d.value)}>
              {d.label}
            </DropdownContentItem>
          );
        })}
      </DropdownContent>
    </DropdownWrapper>
  );
};

const Button = styled.button`
  ${ButtonBaseStyles}

  padding: 0.4rem 1rem;
  color: white;
  border: 2px solid white;
  cursor: pointer;
`;

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;

  :hover .dropdown-content {
    display: block;
  }

  :hover .dropbtn {
    color: black;
    border-color: hsl(55, 98%, 50%);
    background-color: hsl(55, 98%, 50%);
  }
`;

const DropdownContent = styled.div`
  display: none;
  position: absolute;
  color: white;
  background-color: ${color.grayDark};
  font-weight: 700;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

const DropdownContentItem = styled.div`
  padding: 12px 16px;
  font-weight: inherit;
  text-decoration: none;
  border-bottom: 1px solid ${color.gray50};
  display: block;
  cursor: pointer;

  :hover {
    color: black;
    background-color: hsl(55, 98%, 50%);
  }
`;

export default Dropdown;
