import React from "react";
import ReactDOM from "react-dom";
import GlobalStyle from "styles/globalStyles";
import App from "./App";
import WalletProvider from "context/wallet";
import GlobalProvider from "store";

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <GlobalProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </GlobalProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
