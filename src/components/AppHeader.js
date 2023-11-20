import React from "react";
import { Link } from "react-router-dom";

export default class AppHeader extends React.PureComponent {
  render() {
    return (
      <header className="AppHeader">
        <Link className="AppHeader-title" to={{ pathname: "/" }}>
          Rawl
        </Link>
        {" • "}
        <Link className="AppHeader-title" to={{ pathname: "/browse/MIDI" }}>
          MIDI
        </Link>
        {this.props.user ? (
          <>
            {" • "}
            Logged in as {this.props.user.displayName}.{" "}
            <a href="#" onClick={this.props.handleLogout}>
              Logout
            </a>
          </>
        ) : (
          <>
            {" • "}
            <a href="#" onClick={this.props.handleLogin}>
              Login/Sign Up
            </a>{" "}
            to Save Analyses (broken)
          </>
        )}
        {" • "}
        Built on top of{" "}
        <a
          href="https://chiptune.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chip Player JS
        </a>
        {" • "}
        <a
          href="https://github.com/vpavlenko/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Send feedback
        </a>
      </header>
    );
  }
}
