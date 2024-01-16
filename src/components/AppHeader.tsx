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
      <Link className="AppHeader-title" to={{ pathname: "/axes" }}>
        Axes
      </Link>
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/intro" }}>
        Intro
      </Link>
      {" • "}
      <Link className="AppHeader-title" to={{ pathname: "/course" }}>
        Course
      </Link>
      {/* {" • "}
        <Link
          className="AppHeader-title"
          to={{ pathname: "/browse/Classical%20MIDI" }}
        >
          Classical
        </Link> */}
      {" • "}
      Built on top of{" "}
      <a href="https://chiptune.app/" target="_blank" rel="noopener noreferrer">
        Chip Player JS
      </a>
      {user ? (
        <>
          {" • "}
          Logged in as {user.email}.{" "}
          <a href="#" onClick={handleLogout}>
            Logout
          </a>
        </>
      ) : (
        <>
          <a href="#" onClick={handleLogin}>
            {"."}
          </a>{" "}
        </>
      )}
    </header>
  );
};

export default AppHeader;
