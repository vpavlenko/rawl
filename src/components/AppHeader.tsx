import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

const HeaderLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0px 24px;
  text-decoration: none;
  height: 100%;

  &:hover {
    text-decoration: none;
  }
`;

const AppHeader: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const getLinkStyle = (pathPrefix: string): React.CSSProperties => {
    const isActive = path.startsWith(pathPrefix);
    return isActive ? { background: "white", color: "black" } : {};
  };

  return (
    <div
      style={{
        zIndex: 100000000,
        background: "black",
        height: "30px",
        overflow: "hidden",
      }}
    >
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
        Corpus
      </HeaderLink>
      <HeaderLink to="/timeline/" style={getLinkStyle("/timeline")}>
        Timeline
      </HeaderLink>
      <HeaderLink to="/old/" style={getLinkStyle("/old")}>
        Old Landing
      </HeaderLink>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <a href="https://github.com/vpavlenko/rawl" target="_blank">
        <div className="octocat" />
      </a>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <a href="https://vpavlenko.github.io/layouts">Layouts</a>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <a href="https://github.com/vpavlenko/study-music">Books</a>
    </div>
  );
};

export default AppHeader;
