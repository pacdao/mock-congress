import { useEffect, useRef } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import styled from "styled-components";

import useStore from "store/useStore";
import Header from "components/Header";
import ScrollToTop from "components/ScrollToTop";
import SocialLinks from "components/SocialLinks";
import HomePage from "pages/HomePage";
import SECAction from "pages/SECAction";
import SECNFT from "pages/SECNFT";
import { color, device } from "styles/globalStyles";
import CongressPage from "pages/CongressPage/CongressPage";
import CongressNftPage from "pages/CongressNftPage";

function App() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerHeight = useStore((state) => state.headerHeight);
  const width = useStore((state) => state.width);
  const setHeaderHeight = useStore((state) => state.setHeaderHeight);

  useEffect(() => {
    const { height } = headerRef.current?.getBoundingClientRect() || {};
    if (height) setHeaderHeight(height);
  }, [width, setHeaderHeight]);

  return (
    <HashRouter>
      <ScrollToTop />
      <HeaderWrapper ref={headerRef} className="main">
        <SocialLinksWrapper>
          <SocialLinks />
        </SocialLinksWrapper>
        <Header />
      </HeaderWrapper>
      <Main headerHeight={headerHeight}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/congress-nft" element={<CongressNftPage />} />
          <Route path="/sec-action" element={<SECAction />} />
          <Route path="/sec-nft-badge" element={<SECNFT />} />
          <Route path=":congressName" element={<CongressPage />} />
        </Routes>
      </Main>
    </HashRouter>
  );
}

const HeaderWrapper = styled.header`
  padding: 0.1em;
  background-color: ${color.yellow};
`;

const SocialLinksWrapper = styled.div`
  border-bottom: 1px solid hsl(0 0% 0% / 0.25);
`;

type MainProps = {
  headerHeight: number | null;
};

const Main = styled.main<MainProps>`
  padding: 0.25em 1em;
  margin: 0 auto;
  max-width: 1440px;
  ${({ headerHeight }) => {
    if (headerHeight) {
      return `
        height: calc(100vh - ${headerHeight}px);
        overflow-y: scroll;
      `;
    }
  }}

  color: ${color.white};
  background-color: ${color.black};

  header {
    margin-bottom: 1em;

    a: {
      font-size: 400;
    }
  }

  aside {
    color: ${color.gray};

    header {
      color: ${color.white};
    }
  }

  a:hover {
    color: ${color.yellow};
  }

  input {
    color: ${color.yellow};

    :focus {
      outline: 3px solid ${color.yellowActive};
    }
  }

  h1,
  h2,
  label {
    font-weight: 600;
  }

  h1,
  h2 {
    color: ${color.yellow};
  }

  h1 {
    margin: 0;
    margin-bottom: 0.1em;
  }

  h2 {
    font-size: 1.25rem;
  }

  @media ${device.laptop} {
    padding: 2em;
    padding-top: 1em;
  }
`;

export default App;
