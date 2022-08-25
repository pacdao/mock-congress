import type { FC } from "react";

import styled from "styled-components";
import { color } from "styles/globalStyles";

export type Variant = "success" | "error";

type Props = {
  className?: string;
  variant: Variant;
};

const Alert: FC<Props> = ({ className, variant, children }) => {
  return (
    <Wrapper className={className} variant={variant}>
      {children}
    </Wrapper>
  );
};

Alert.defaultProps = {
  className: "",
};

type WrapperProps = {
  variant: Variant;
};

const Wrapper = styled.div<WrapperProps>`
  padding: 0.5em;

  color: ${color.black};
  background-color: ${({ variant }) => {
    if (variant === "success") {
      return color.success;
    } else if (variant === "error") {
      return color.error;
    }
  }};
  border-radius: 1px;
`;

export default Alert;
