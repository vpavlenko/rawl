import * as React from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";

const BookContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  gap: 0;
`;

const Navigation = styled.nav`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 250px;
  padding: 20px;
  background: #111;
  overflow-y: auto;
`;

const Content = styled.main`
  flex: 1;
  margin-left: 250px;
  padding: 40px;
  color: #ddd;
  max-width: 1200px;
`;

const NavLink = styled(Link)<{ active: boolean }>`
  display: block;
  padding: 10px;
  color: ${(props) => (props.active ? "#fff" : "#999")};
  text-decoration: none;
  border-radius: 4px;
  background: ${(props) => (props.active ? "#333" : "transparent")};

  &:hover {
    background: #222;
    color: #fff;
  }
`;

const chapters = [
  { id: "intro", title: "Introduction" },
  { id: "cmajor", title: "C Major Harmony" },
];

const BookLayout: React.FC = () => {
  const { chapter } = useParams<{ chapter: string }>();

  const getComponent = () => {
    switch (chapter) {
      case "intro":
        return React.lazy(() => import("./Intro"));
      case "cmajor":
        return React.lazy(() => import("./CMajorHarmony"));
      default:
        return null;
    }
  };

  const ChapterComponent = getComponent();

  return (
    <BookContainer>
      <Navigation>
        <h3 style={{ color: "#fff", marginBottom: "20px" }}>Chapters</h3>
        {chapters.map((ch) => (
          <NavLink key={ch.id} to={`/book/${ch.id}`} active={chapter === ch.id}>
            {ch.title}
          </NavLink>
        ))}
      </Navigation>
      <Content>
        <React.Suspense fallback={<div>Loading...</div>}>
          {ChapterComponent && <ChapterComponent />}
        </React.Suspense>
      </Content>
    </BookContainer>
  );
};

export default BookLayout;
