import styled from "styled-components";
import { color } from "styles/globalStyles";
import { ButtonBaseStyles } from "./Button";

type IconButtonProps = {
  variant?: "contained" | "outlined";
};

export const IconButton = styled.button<IconButtonProps>`
  ${ButtonBaseStyles}

  align-items: center;
  display: inline-flex;

  border-color: transparent;

  span {
    margin: 0 0.25em;
  }

  :hover {
    border-color: transparent;
  }

  svg {
    user-select: none;
  }

  ${({ variant }) => {
    if (variant === "outlined") {
      return `
        border-color: inherit;

        :hover {
          color: ${color.black};
          background-color: ${color.yellow};
          border-color: ${color.yellow};
        }
      `;
    }

    if (variant === "contained") {
      return `
        color: ${color.black};
        border-color: ${color.yellow};
        background-color: ${color.yellow};

        :hover {
          background-color: ${color.yellowHover};
        }
      `;
    }
  }}
`;
