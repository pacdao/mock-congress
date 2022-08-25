import type { FC } from "react";

import styled from "styled-components";

import DiscordIcon from "assets/images/discord.png";
import TelegramIcon from "assets/images/telegram.png";
import TwitterIcon from "assets/images/twitter.png";
import SubstackIcon from "assets/images/substack.png";
import { device } from "styles/globalStyles";
import { PAC_DAO_DISCORD_URL, PAC_DAO_TELEGRAM_URL, PAC_DAO_TWITTER_URL, PAC_DAO_SUBSTACK_URL } from "constants/index";

type LinkProps = {
  className?: string;
  href: string;
  title: string;
};

const Link: FC<LinkProps> = ({ className, href, title, children }) => (
  <a className={className} href={href} title={title} target="_blank" rel="noreferrer">
    {children}
  </a>
);

const SocialLinks = () => {
  return (
    <Wrapper className="main">
      <div>
        <StyledLink href={PAC_DAO_DISCORD_URL} title="Discord">
          <img src={DiscordIcon} alt="Discord" width="20" />
        </StyledLink>
        <StyledLink href={PAC_DAO_TELEGRAM_URL} title="Telegram">
          <img src={TelegramIcon} alt="Telegram" width="20" />
        </StyledLink>
        <StyledLink href={PAC_DAO_TWITTER_URL} title="Twitter">
          <img src={TwitterIcon} alt="Twitter" width="20" />
        </StyledLink>
        <StyledLink href={PAC_DAO_SUBSTACK_URL} title="Substack">
          <img src={SubstackIcon} alt="Substack" width="20" />
        </StyledLink>
      </div>
      <Copyright>© {new Date().getFullYear()} PAC DAO</Copyright>
    </Wrapper>
  );
};

const StyledLink = styled(Link)``;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;

  ${StyledLink}:not(:last-of-type) {
    margin-right: 0.5em;
  }

  @media ${device.tablet} {
    justify-content: flex-end;
  }
`;

const Copyright = styled.span`
  margin-left: 1em;
`;

export default SocialLinks;
