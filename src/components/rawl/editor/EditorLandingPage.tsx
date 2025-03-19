import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

export const StyledButton = styled.button`
  padding: 15px 30px;
  font-size: 18px;
  background: black;
  color: white;
  border: 1px solid white;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #444;
  }
`;

// Link version of the same button
const StyledButtonLink = styled(Link)`
  padding: 15px 30px;
  font-size: 18px;
  background: black;
  color: white;
  border: 1px solid white;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  display: inline-block;

  &:hover {
    background: #444;
    color: white;
    text-decoration: none;
  }
`;

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  padding: 20px;
`;

const EditorLandingPage: React.FC = () => {
  return (
    <LandingContainer>
      <StyledButtonLink to="/e/new">New Score</StyledButtonLink>
    </LandingContainer>
  );
};

export default EditorLandingPage;
