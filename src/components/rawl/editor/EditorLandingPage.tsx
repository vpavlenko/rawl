import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 40px;
  color: #f0f0f0;
  text-align: center;
`;

const NewScoreButton = styled(Link)`
  display: inline-block;
  background-color: #4c8bf5;
  color: white;
  font-size: 18px;
  padding: 15px 30px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3a78e7;
    text-decoration: none;
    color: white;
  }
`;

const EditorLandingPage: React.FC = () => {
  return (
    <LandingContainer>
      <NewScoreButton to="/e/new">New Score</NewScoreButton>
    </LandingContainer>
  );
};

export default EditorLandingPage;
