import * as React from "react";
import styled from "styled-components";
import ExternalLink from "components/ExternalLink";
import { Link } from "react-router-dom";



const SECLandingPageURL = "https://www.sec.gov/rules/proposed.shtml";
const YouTubeWalkThruURL = "https://youtu.be/95lsndtRrBk";

const SECAction: React.FC = () => {

  return (
    <ContentWrapper>
      <Section>
        <h1>SEC Letter Writing</h1>
        <p>
          LeXpunK has partnered with PAC DAO to provide developers and DeFi enthusiasts with a template to comment on
          the SEC Proposed Amendments to Reg ATS. We drafted form language and importantly, included a section for you
          to share your background and why you decided to comment on the Proposal.
        </p>
        <p>
          The sweeping language in encompassing a “communications systems protocol” as an exchange, has detrimental
          effects to the burgeoning DeFi industry. This amended definition, whereby “communication protocol systems”,
          which are vaguely noted in the Proposal to “include a[ny] system that offers protocols and the use of non-firm
          trading interest to bring together buyers and sellers of securities” may include AMMs (as the SEC maintains
          that certain digital assets are securities).
        </p>
        <p>We have some guidelines that we suggest you use in your section to comment:</p>
        <ul>
          <li>
            What role you play in the DeFi ecosystem and how you came to assume that role (build credibility to the SEC
            as to why your voice matters)
          </li>
          <li>How DeFi has improved your life or why you’re interested in the regulation</li>
          <li>Discuss how this impacts you and those in your community</li>
          <li>
            Express concerns about the expansion of the definition of “exchange” and authority into the regulation of
            technologists / personal liability – why the expansion of exchange definition is effectively a ban on DeFi
          </li>
          <li>What do you believe these expansions will mean for work you do and the industry</li>
          <li>How this targets builders and what the likely outcome would be</li>
          <li>Concern for competitiveness of the U.S.</li>
          <li>Do not attack or accuse the SEC (this will diminish credibility)</li>
        </ul>
        <p>
          This effort gives you, the developer, the builder, the advocate, the opportunity to participate in this
          seminal notice and comment period. We encourage you to take time to share your perspective, how you feel this
          may impact your willingness to develop DeFi projects in the U.S. For years, the SEC has relied on the
          narrative to “come talk to us.” Take advantage of the SEC’s open commentary period and be proud that you
          “fought for Web3.”
        </p>

        <h2>Sample Letter</h2>
        <p>
          Use this template to help you draft your letter:  <a href='/Reg_ATS_Draft_Language.docx'>Reg_ATS_Draft_Language.docx</a>
        </p>

        <h2>NFT badge for Letter Writing</h2>
        <p>
          <Link to="/sec-nft-badge">Click here</Link> to learn about the NFT badge for submitting a letter.
        </p>

        <h2>How to Comment</h2>

        <p><ExternalLink href={YouTubeWalkThruURL}>Watch video</ExternalLink> or read the following instructions:</p>

        <ol>
          <li>
            Start at the <ExternalLink href={SECLandingPageURL}>SEC Proposed Rules landing page</ExternalLink>
          </li>
          <li>
            Find File No:{" "}
            <strong>
              <em>S7-02-22</em>
            </strong>
          </li>
          <li>Click “Submit comments on S7-02-22”</li>
          <li>Fill out the form with your own name and affiliation (not LeXpunK or PAC DAO)</li>
          <li>In Comments Section: put the words "Comments attached” in the text box.</li>
          <li>Click Continue → there you will be directed to attach your PDF comment.</li>
        </ol>
      </Section>

      
    </ContentWrapper>
  );
};

const ContentWrapper = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  margin-top: 2rem;
`;

const Section = styled.div``;

export default SECAction;
