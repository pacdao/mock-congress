import * as React from "react";

type Props = {
  className?: string;
  href: string;
};

const ExternalLink: React.FC<Props> = ({ className, href, children }) => {
  return (
    <a className={className} target="_blank" rel="noreferrer" href={href}>
      {children}
    </a>
  );
};

ExternalLink.defaultProps = {
  className: "",
};

export default ExternalLink;
