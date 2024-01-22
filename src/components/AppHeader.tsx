import { User } from "firebase/auth";
import * as React from "react";
import { Link } from "react-router-dom";

const AppHeader: React.FC<{
  user: User | null;
  handleLogin: React.MouseEventHandler;
  handleLogout: React.MouseEventHandler;
}> = ({ user, handleLogin, handleLogout }) => {
  return (
    <header className="AppHeader">
      <Link className="AppHeader-title" to={{ pathname: "/" }}>
        Rawl
      </Link>
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/browse/MIDI" }}>
        Pop
      </Link>
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/axes" }}>
        Axes
      </Link>
      {" • "}
      <Link
        className="AppHeader-title"
        to={{ pathname: "/browse/Classical MIDI" }}
      >
        Classical
      </Link>
      {" • "}
      <a href="https://github.com/vpavlenko/rawl" target="_blank">
        <div className="octocat" />
      </a>
      {/* {" • "}
        <Link
          className="AppHeader-title"
          to={{ pathname: "/browse/Classical%20MIDI" }}
        >
          Classical
        </Link> */}
    </header>
  );
};

export default AppHeader;
