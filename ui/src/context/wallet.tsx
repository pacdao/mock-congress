import type { FC } from "react";

import { createContext, useContext, useEffect, useReducer } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";

type Props = {};

type State = {
  address: string | null;
  loaded: boolean;
  provider: ethers.providers.Web3Provider | null;
  haveWallet: boolean;
  signer: ethers.providers.JsonRpcSigner | null;
};

interface ContextProps extends State {
  connect: () => void;
}

const WalletContext = createContext<ContextProps>(undefined!);

const reducer = (state: State, partialState: Partial<State>) => {
  return { ...state, ...partialState };
};

const WalletProvider: FC<Props> = ({ children }) => {
  const DEFAULT_STATE = {
    address: null,
    loaded: false,
    provider: null,
    haveWallet: false,
    signer: null,
  };

  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  // onMount
  useEffect(() => {
    (async () => {
      try {
        const haveProvider = await detectEthereumProvider();
        if (haveProvider) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          const address = accounts[0];

          dispatch({
            provider,
            address: address || null,
            haveWallet: true,
            signer: provider.getSigner(),
            loaded: true,
          });
        } else {
          dispatch({ haveWallet: false, loaded: true });
        }
      } catch (error) {
        console.log("provider error", error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      if (state.provider) {
        const accounts = await state.provider.listAccounts();
        const address = accounts[0];
        window.location.reload();

        if (address) {
          dispatch({ address });
        }
      }
    } catch (error) {
      console.log("connect error", error);
    }
  };

  const value = {
    ...state,
    connect,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export function useWallet() {
  return useContext(WalletContext);
}

export default WalletProvider;
