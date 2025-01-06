import * as React from "react";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { AppContext } from "./AppContext";
import SignIn from "./SignIn";

const HEADER_HEIGHT = "30px";

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: black;
  height: ${HEADER_HEIGHT};
  overflow: hidden;
  z-index: 100000000;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
`;

const baseLinkStyles = css`
  display: inline-flex;
  align-items: center;
  padding: 0px 24px;
  text-decoration: none;
  height: ${HEADER_HEIGHT};

  &:hover {
    text-decoration: none;
    background: #333;
  }
`;

const HeaderLink = styled(Link)`
  ${baseLinkStyles}
`;

const ExternalLink = styled.a`
  ${baseLinkStyles}
`;

const ExternalLinks = styled.div`
  display: flex;
  align-items: center;
`;

const AppHeader: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const {
    user,
    handleLogin,
    handleLogout,
    analysisEnabled,
    handleToggleAnalysis,
  } = useContext(AppContext);

  const getLinkStyle = (pathPrefix: string): React.CSSProperties => {
    if (pathPrefix === "/corpus") {
      return path === "/corpus/" ? { background: "white", color: "black" } : {};
    }
    return path.startsWith(pathPrefix)
      ? { background: "white", color: "black" }
      : {};
  };

  return (
    <HeaderContainer>
      <NavLinks>
        <HeaderLink
          className="AppHeader-title"
          to={{ pathname: "/" }}
          style={getLinkStyle("/100")}
        >
          Rawl
        </HeaderLink>
        <HeaderLink to="/s/" style={getLinkStyle("/s")}>
          Structures
        </HeaderLink>
        <HeaderLink to="/corpus/" style={getLinkStyle("/corpus")}>
          Pieces
        </HeaderLink>
        <HeaderLink to="/timeline/" style={getLinkStyle("/timeline")}>
          Timeline
        </HeaderLink>
        <HeaderLink to="/forge/" style={getLinkStyle("/forge")}>
          Forge
        </HeaderLink>
      </NavLinks>

      <ExternalLinks>
        <ExternalLink
          href="https://github.com/vpavlenko/rawl"
          target="_blank"
          rel="noreferrer"
        >
          <div className="octocat" />
        </ExternalLink>
        <ExternalLink
          href="https://vpavlenko.github.io/layouts"
          target="_blank"
          rel="noreferrer"
        >
          Layouts
        </ExternalLink>
        <ExternalLink
          href="https://github.com/vpavlenko/study-music"
          target="_blank"
          rel="noreferrer"
        >
          Books
        </ExternalLink>
        <SignIn
          user={user}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          handleToggleAnalysis={handleToggleAnalysis}
          analysisEnabled={analysisEnabled}
        />
      </ExternalLinks>
    </HeaderContainer>
  );
};

export default AppHeader;
