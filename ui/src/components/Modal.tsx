import type { FC } from "react";

import styled from "styled-components";

import { color } from "styles/globalStyles";
import { IconButton } from "components/IconButton";
import { ReactComponent as CloseIcon } from "assets/images/close.svg";

type Props = {
  open: boolean;
  dismissible?: boolean;
  title?: string;
  handleClose: () => void;
};

const Modal: FC<Props> = ({ dismissible, open, title, children, handleClose }) => {
  return open ? (
    <ModalWrapper>
      <Wrapper>
        {(title || dismissible) && (
          <Header>
            <span>{title}</span>
            <IconButton onClick={handleClose}>
              <CloseIcon />
              <span className="hide">Close modal</span>
            </IconButton>
          </Header>
        )}
        <div>{children}</div>
      </Wrapper>
    </ModalWrapper>
  ) : null;
};

const ModalWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 999;

  background-color: hsl(0, 0%, 0%, 50%);

  backdrop-filter: blur(2px);
`;

const Wrapper = styled.div`
  padding: 1em;

  color: ${color.white};
  background-color: ${color.black};
  border: 3px solid ${color.grayDark};
`;

const Header = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export default Modal;
