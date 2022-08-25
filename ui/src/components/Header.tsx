import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import Logo from "assets/images/logo2x.png";
import { useWallet } from "context/wallet";
import { PAC_DAO_BASEURL, PAC_DAO_EU_URL } from "constants/index";
import { shortenAddress } from "utils";
import Button from "components/Button";
import ExternalLink from "components/ExternalLink";
import { device } from "styles/globalStyles";

const Header = () => {
  const { address, loaded, provider, connect } = useWallet();

  const shortenedAddress = React.useMemo(() => {
    if (address) {
      return shortenAddress(address);
    }
    return "";
  }, [address]);

  return (
    <Wrapper className="main">
      <Link to="/">
        <Img src={Logo} alt="Pac Crypto Activism" width="98px" height="58px" />
      </Link>
      <Nav>
        <ExternalLink href={`${PAC_DAO_EU_URL}`}>&#x1F1EA;&#x1F1FA;EU</ExternalLink>
        <Link to="/sec-action">&#10071;SEC Action</Link>
        <ExternalLink href={`${PAC_DAO_BASEURL}/about-pac-dao`}>&#8505;&#65039; About</ExternalLink>
        <ExternalLink href={`${PAC_DAO_BASEURL}/pac-dao-nfts`}>&#127912; NFTs</ExternalLink>
      </Nav>
      <Grow />
      {provider && (
        <Button variant="header" disabled={!loaded} onClick={connect} style={{ color: "#000000"}}>
          {!loaded ? "Loading..." : shortenedAddress || "Connect"}
        </Button>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  font-size: 1.25em;
  text-transform: uppercase;

  @media ${device.tablet} {
    align-items: flex-end;
    flex-direction: row;
  }
`;

const Img = styled.img`
  margin-top: 1em;
`;

const Grow = styled.span`
  flex-grow: 1;
  margin-top: 1em;
`;

const Nav = styled.nav`
  margin-left: 0.25em;

  @media ${device.tablet} {
    display: flex;
  }
`;

export default Header;
