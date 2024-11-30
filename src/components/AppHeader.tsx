import * as React from "react";
import { Link } from "react-router-dom";

const AppHeader: React.FC = () => {
  return (
    <header className="AppHeader">
      <Link className="AppHeader-title" to={{ pathname: "/" }}>
        Rawl
      </Link>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <a href="https://github.com/vpavlenko/rawl" target="_blank">
        <div className="octocat" />
      </a>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <a href="/book">Book</a>
    </header>
  );
};

export default AppHeader;
