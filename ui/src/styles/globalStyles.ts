import { createGlobalStyle } from "styled-components";

export const size = {
  tablet: "768px",
  laptop: "1024px",
};

export const device = {
  tablet: `(min-width: ${size.tablet})`,
  laptop: `(min-width: ${size.laptop})`,
  mobile: `(max-width: ${size.tablet})`,
};

export const color = {
  yellow: "hsl(55, 98%, 50%)",
  yellow05: "hsl(55, 98%, 50%, 5%)",
  yellow10: "hsl(55, 98%, 50%, 10%)",
  yellow20: "hsl(55, 98%, 50%, 20%)",
  yellow50: "hsl(55, 98%, 50%, 50%)",
  yellow80: "hsl(55, 98%, 50%, 80%)",
  yellowA1: "hsl(55, 98%, 50%, 10%)",
  yellowHover: "hsl(55, 98%, 70%)",
  yellowActive: "hsl(55, 98%, 70%)",
  red: "#9f1213",
  blue: "#0E0E77",

  black: "hsl(0deg 0% 0% / 98%)",
  black50: "hsl(0deg 0% 0% / 50%)",
  gray: "hsl(0 0% 67% / 1)",
  gray10: "hsl(0 0% 67% / 0.1)",
  gray50: "hsl(0 0% 67% / 0.5)",
  grayDark: "hsl(0 0% 40% / 1)",
  white: "#ffffff",
  white80: "hsl(150 11% 96% / 0.8)",
  border: "hsl(0 0% 20% / 1)",
  focus: "blue",

  success: "hsl(126, 82%, 34%)",
  error: "hsl(0, 95%, 53%)",
};

const GlobalStyle = createGlobalStyle`
  * {
    font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0 auto;
    padding: 0;

    font-family: 'Readex Pro', sans-serif;
    font-weight: 300;

    background-color: #030708;

    @media ${device.laptop} {
      height: 100vh;
      overflow: hidden;

      background-image: url("/images/poster1.jpeg");
      background-size: 430px 590px;
      background-position: center bottom;
      background-repeat: repeat-x;
    }
  }

  a {
    color: inherit;
    cursor: pointer;
  }
  
  input {
    min-height: 30.5px;
  }

  textarea {
    padding: 1em;
  }

  .hide:not(:focus):not(:active) {
    clip: rect(0 0 0 0); 
    clip-path: inset(100%); 
    height: 1px; 
    overflow: hidden; 
    position: absolute; 
    white-space: nowrap; 
    width: 1px; 
  }

  .mobileDownOnly {
    display: block;

    @media ${device.laptop} {
      display: none;
    }
  }

  .!mobileDownOnly {
    display: none;

    @media ${device.laptop} {
      display: block;
    }
  }


  // ***** APP HEADER  ***** //
  div#root > header .main {
    margin: 0 auto;
    max-width: 1440px;

    padding: 0.25em 1em;

    a {
      padding: 0 0.5em;

      font-weight: 600;
      :hover {
        color: ${color.black};
      }
    }
  }
`;

export default GlobalStyle;
