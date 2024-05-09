import * as React from "react";
import { Link, useHistory } from "react-router-dom";

const DirectoryLink: React.FC<
  React.PropsWithChildren<{
    to: string;
    dim: boolean;
    isBackLink: boolean;
  }>
> = ({ to, dim, isBackLink, children }) => {
  const history = useHistory();

  return (
    <Link
      to={{
        pathname: to.replace("%25", "%2525"),
      }}
      className={dim ? "DirectoryLink-dim" : "DirectoryLink-another"}
      onClick={(e) => {
        if (isBackLink) {
          e.preventDefault();
          history.goBack();
        }
      }}
    >
      {children}
    </Link>
  );
};

export default DirectoryLink;
