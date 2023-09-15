import React from "react";
import { Link } from 'react-router-dom';

export default class AppHeader extends React.PureComponent {
  render() {
    return (
      <header className="AppHeader">
        <Link className="AppHeader-title" to={{ pathname: "/" }}>Chiptheory</Link>
        {this.props.user ?
          <>
            {' • '}
            Logged in as {this.props.user.displayName}.
            {' '}
            <a href="#" onClick={this.props.handleLogout}>Logout</a>
          </>
          :
          <>
            {' • '}
            <a href="#" onClick={this.props.handleLogin}>Login/Sign Up</a> to Save Analyses
          </>
        }
        {' • '}
        Built on top of{" "}
        <a href="https://chiptune.app/" target="_blank" rel="noopener noreferrer">
          Chip Player JS
        </a>
        {' • '}
        Send feedback to the author of{" "}
        <a href="https://github.com/vpavlenko/study-music" target="_blank" rel="noopener noreferrer">
          study-music
        </a>
      </header>
    );
  }
}
