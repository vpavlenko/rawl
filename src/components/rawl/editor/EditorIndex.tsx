import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { scores } from "./scores";

const EditorIndexContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const EditorIndexTitle = styled.h1`
  color: #d4d4d4;
  margin-bottom: 20px;
`;

const EditorIndexList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EditorIndexItem = styled(Link)`
  padding: 10px;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 4px;
  color: #d4d4d4;
  text-decoration: none;
  display: block;

  &:hover {
    background: #2d2d2d;
    color: #fff;
  }
`;

const EditorIndex: React.FC = () => {
  return (
    <EditorIndexContainer>
      <EditorIndexTitle>Available Scores</EditorIndexTitle>
      <EditorIndexList>
        {Object.keys(scores).map((slug) => (
          <EditorIndexItem key={slug} to={`/e/${slug}`}>
            {slug.replace(/---/g, " – ").replace(/-/g, " ")}
          </EditorIndexItem>
        ))}
      </EditorIndexList>
    </EditorIndexContainer>
  );
};

export default EditorIndex;
