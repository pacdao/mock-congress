import { FC } from "react";

import { useEffect } from "react";
import useStore from "store/useStore";

const getWidth = () => window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

const GlobalProvider: FC = ({ children }) => {
  const setWidth = useStore((state) => state.setWidth);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const resizeListener = (evt: UIEvent) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setWidth(getWidth()), 150);
    };

    window.addEventListener("resize", resizeListener);

    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, [setWidth]);

  return <>{children}</>;
};

export default GlobalProvider;
