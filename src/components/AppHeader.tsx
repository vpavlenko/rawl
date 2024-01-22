import * as React from "react";
import { Link } from "react-router-dom";

const AppHeader: React.FC = () => {
  return (
    <header className="AppHeader">
      <Link className="AppHeader-title" to={{ pathname: "/" }}>
        Rawl
      </Link>
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/MIDI" }}>
        Songs
      </Link>
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/axes" }}>
        Tags
      </Link>
      {" • "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Classical MIDI" }}
      >
        Classical Music
      </Link>
      {" • "}
      <a href="https://github.com/vpavlenko/rawl" target="_blank">
        <div className="octocat" />
      </a>
    </header>
  );
};

export default AppHeader;
