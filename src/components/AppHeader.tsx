import * as React from "react";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "./AppContext";
import SignIn from "./SignIn";

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: black;
  height: 30px;
  overflow: hidden;
  z-index: 100000000;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0px 24px;
  text-decoration: none;
  height: 30px;

  &:hover {
    text-decoration: none;
  }
`;

const ExternalLink = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0px 24px;
  text-decoration: none;
  height: 100%;
  color: inherit;

  &:hover {
    text-decoration: none;
  }
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
