import styled, { css } from "styled-components";

import { color } from "styles/globalStyles";
import React, { createRef, forwardRef } from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
  variant?: "header" | "secondary" | "text" | "cta";
  isLoading?: boolean;
  enabled?: true | false;
}

export const ButtonBaseStyles = css`
  padding: 0.25em 0.5em;
  position: relative;

  font-size: inherit;
  font-weight: bold;
  text-transform: uppercase;

  color: inherit;
  background-color: transparent;
  border-width: 2px;
  border-style: solid;
  border-radius: 1px;
  cursor: pointer;

  :active {
    transform: translate3d(1px, 1px, 1px);
  }
`;

const Button = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const { className, children, ...rest } = props;
  const buttonRef = ref ?? createRef();

  return (
    <StyledButton ref={buttonRef} className={className} {...rest}>
      <ButtonContent>{children}</ButtonContent>
    </StyledButton>
  );
});

const ButtonContent = styled.span``;

const StyledButton = styled.button<Pick<Props, "isLoading" | "variant" | "enabled">>`
  ${ButtonBaseStyles}

  &:not(:disabled) {
    border-color: ${color.gray};
    color: ${color.yellow};
    border-color: ${color.yellow};
  }

  :disabled {
    color: ${color.grayDark};
    cursor: initial;
  }

  :hover {
    &:not(:disabled) {
      color: ${color.black};
      background-color: ${color.yellow};
    }
  }

  ${({ isLoading }) => {
    if (isLoading) {
      return `
        ${ButtonContent} {
          visibility: hidden;
          opacity: 0;
        }
      
        &::after {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          border: 2px solid transparent;
          border-top-color: ${color.grayDark};
          border-radius: 50%;
          animation: spinner-animation 1s ease infinite;
        }
        
        @keyframes spinner-animation {
          from {
            transform: rotate(0turn);
          }
        
          to {
            transform: rotate(1turn);
          }
        }
      `;
    }
  }}

  ${({ variant, enabled }) => {
    if (enabled !== undefined && !enabled) {
      return `
        color: ${color.red};
        pointer-events: none;
      `;
    }

    if (variant === "secondary") {
      return `
        color: ${color.grayDark};
      `;
    }

    if (variant === "cta") {
      return `
        color: ${color.yellowActive};
      `;
    }

    if (variant === "header") {
      return `
        border-color: ${color.black};

        :hover {
          color: ${color.yellow};
          background-color: ${color.black};
        }
      `;
    }

    if (variant === "text") {
      return `
        border: none;
        text-transform: initial;
      `;
    }
  }}
`;

export default Button;
