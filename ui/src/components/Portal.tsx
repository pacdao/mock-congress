import type { FC } from 'react'

import * as React from "react";
import ReactDOM from "react-dom";

// const appRoot = document.getElementById('root');
const modalRoot = document.getElementById("modal-root");

const Portal: FC = ({ children }) => {
  const el = React.useRef(document.createElement('div'))

  React.useEffect(() => {
    const current = el.current
    modalRoot?.appendChild(current)

    return () => {
      modalRoot?.removeChild(current)
    }
  }, [])

  return ReactDOM.createPortal(children, el.current);
};

export default Portal
