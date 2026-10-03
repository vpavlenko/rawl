import * as React from "react";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import { ADMIN_USER_ID } from "./App";
import { AppContext } from "./AppContext";
import SignIn from "./SignIn";
import { SearchContext } from "./SearchContext";
import { PIECES_SEARCH_PLACEHOLDER } from "./rawl/CorpusSearch";

export const HEADER_HEIGHT = "30px";

const HeaderContainer = styled.div`
  position: relative;
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

  @media (max-width: 640px) {
    a:nth-of-type(n + 4) {
      display: none;
    }
  }

  @media (max-width: 400px) {
    a:nth-of-type(n + 3) {
      display: none;
    }
  }
`;

export const baseLinkStyles = css`
  display: inline-flex;
  align-items: center;
  padding: 0px 18px;
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

  @media (max-width: 1700px) {
    display: none;
  }
`;

const NavSearch = styled.div<{ $expanded: boolean }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: ${({ $expanded }) => ($expanded ? "50%" : "160px")};
  max-width: 50%;
  z-index: 1;
  height: 26px;
  background: #fff;
  border-radius: 3px;
  overflow: hidden;

  input {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 3px ${({ $expanded }) => ($expanded ? "28px" : "8px")} 3px 8px;
    border: 1px solid #666;
    border-radius: 3px;
    background: #fff;
    color: #111;
    font: inherit;
    font-size: 12px;
    text-overflow: ellipsis;
    &:focus {
      outline: none;
      border-color: #ffe45c;
    }
  }

  button {
    position: absolute;
    right: 1px;
    top: 1px;
    width: 26px;
    height: 24px;
    padding: 0;
    border: 0;
    background: #fff;
    color: #111;
    font-size: 20px;
    cursor: pointer;
  }

  @media (max-width: 1700px) {
    left: auto;
    right: 8px;
    transform: none;
    width: ${({ $expanded }) => ($expanded ? "min(320px, 50%)" : "160px")};
    max-width: none;
  }

  @media (max-width: 400px) {
    width: ${({ $expanded }) => ($expanded ? "50%" : "140px")};
  }
`;

const AppHeader: React.FC = () => {
  const search = useContext(SearchContext);
  const location = useLocation();
  const path = location.pathname;
  const {
    user,
    handleLogin,
    handleLogout,
    enableManualRemeasuring,
    handleToggleManualRemeasuring,
    currentMidi,
  } = useContext(AppContext);
  const currentAnnotationKey =
    currentMidi?.analysisKey ||
    (currentMidi?.slug && currentMidi.slug !== ""
      ? `f/${currentMidi.slug}`
      : path.startsWith("/f/")
      ? path.slice(1)
      : null);

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
        <HeaderLink to="/corpus/" style={getLinkStyle("/corpus")}>
          Pieces
        </HeaderLink>
        <HeaderLink to="/lakh/" style={getLinkStyle("/lakh")}>
          Lakh
        </HeaderLink>
        <HeaderLink to="/s/" style={getLinkStyle("/s")}>
          Structures
        </HeaderLink>
        <HeaderLink to="/e/" style={getLinkStyle("/e")}>
          Editor
        </HeaderLink>
        <HeaderLink to="/blog/" style={getLinkStyle("/blog")}>
          Blog
        </HeaderLink>
        {/* <HeaderLink to="/d/" style={getLinkStyle("/d")}>
          Decompose
        </HeaderLink> */}
      </NavLinks>

      <NavSearch $expanded={search.expanded} role="search">
        <input
          type="text"
          aria-label="Search Pieces and Lakh"
          placeholder={search.expanded ? PIECES_SEARCH_PLACEHOLDER : "Search pieces"}
          value={search.query}
          onFocus={() => search.setExpanded(true)}
          onChange={(event) => search.setQuery(event.target.value)}
        />
        {search.expanded && (
          <button
            type="button"
            aria-label="Close search"
            title="Close search (Escape)"
            onClick={search.close}
          >
            ×
          </button>
        )}
      </NavSearch>

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
          href="https://vpavlenko.github.io/d/"
          target="_blank"
          rel="noreferrer"
          aria-label="Decompose"
        >
          🔮
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
          handleToggleManualRemeasuring={handleToggleManualRemeasuring}
          enableManualRemeasuring={enableManualRemeasuring}
          adminUserId={ADMIN_USER_ID}
          currentAnnotationKey={currentAnnotationKey}
        />
      </ExternalLinks>
    </HeaderContainer>
  );
};

export default AppHeader;
