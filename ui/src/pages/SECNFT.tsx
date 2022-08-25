import * as React from "react";
import styled from "styled-components";
import ExternalLink from "components/ExternalLink";
import { LEX_TELEGRAM_URL, PAC_DAO_DISCORD_URL } from "constants/index";
import { device } from "styles/globalStyles";

const ZACH_WEST_LINKTREE = "https://linktr.ee/alphazwest";
const ETHERSCAN_URL = "https://etherscan.io/address/0xb1a1c1AC9e41298f2570BB8eE4c482E9E32A7f6E";
const GITHUB_URL = "https://github.com/pacdao/paclex-action";
const OPENSEA_URL = "https://opensea.io/collection/pacdaolexpunk-action";
const OPENSEA_POLYGON_URL = "https://opensea.io/collection/pacdaolexpunk-action-v2";


const SECNFT: React.FC = () => {

  return (
    <>
      <ContentWrapper>
        
        <NFTSection>
          <h1>SEC Action NFT</h1>
          <Img src="/images/eagleThree.jpeg" alt="SEC letter writing NFT" />
        </NFTSection>

        <Section>
        <h2>How to obtain</h2>
          <p>After writing a letter join <ExternalLink href={LEX_TELEGRAM_URL}>LEX Telegram</ExternalLink> or <ExternalLink href={PAC_DAO_DISCORD_URL}>PACDAO Discord</ExternalLink> for instructions on this free (minus gas) NFT mint!</p>

          <h2>Artist</h2>
          <p>Special shoutout to Zack West Dreamer&mdash;designer, builder working to help build a better world for everyone.</p>
          <p><ExternalLink href={ZACH_WEST_LINKTREE}>Click here</ExternalLink> to follow his work.</p>
          
          <Img style={{width: "13rem"}} src="/images/zackWest.jpeg" alt="SEC letter writing NFT" />

	<h2>NFT Details</h2>
	<ul>
		<li><ExternalLink href={ETHERSCAN_URL} >Etherscan</ExternalLink>
		</li>
		<li><ExternalLink href={GITHUB_URL} >Github</ExternalLink>
		</li>
		<li><ExternalLink href={OPENSEA_URL} >OpenSea (ETH)</ExternalLink>
		</li>
		<li><ExternalLink href={OPENSEA_POLYGON_URL} >OpenSea (Polygon)</ExternalLink>
		</li>
	</ul>
	
          
        </Section>
        
      </ContentWrapper>
    </>
  );
};

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  overflow-y: scroll;

  @media ${device.mobile} {
    flex-direction: column;
  }
`;

const Section = styled.div`
  flex-grow: 1;
  padding: 1em;
  padding-left: 0;
`;

const NFTSection = styled.div`
  flex-grow: 1;
  padding: 1em;
  padding-left: 0;
  width: 33%;
  @media ${device.mobile} {
    width: 100%;
  }
`;

const Img = styled.img`
  height: auto;
  width: 95%;
`;

export default SECNFT;
