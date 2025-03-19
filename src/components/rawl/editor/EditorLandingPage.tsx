import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { beautifySlug } from "../corpora/utils";

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
  padding: 50px 20px;
  margin-top: 30px; /* Add space below the header */
  min-height: calc(100vh - 30px); /* Subtract header height */
  box-sizing: border-box;
`;

// Styled components for the scores list
const ScoresContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-top: 30px;
  text-align: left;
`;

const ScoresTitle = styled.h2`
  color: white;
  margin-bottom: 15px;
`;

const ScoresList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const ScoreItem = styled.li`
  margin: 8px 0;
`;

const ScoreLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 5px 0;
  display: block;

  &:hover {
    text-decoration: underline;
  }
`;

const EditorLandingPage: React.FC = () => {
  // Hard-coded list of featured scores
  const featuredScores = [
    "schubert_d365_09",
    "Gravity_Falls_Opening",
    "passacaglia---handel-halvorsen",
    "papers-please",
    "idea-15---gibran-alcocer",
    "idea-n.10---gibran-alcocer",
  ];

  return (
    <LandingContainer>
      <StyledButtonLink to="/e/new">New Score</StyledButtonLink>

      <ScoresContainer>
        <ScoresTitle>Featured Scores</ScoresTitle>
        <ScoresList>
          {featuredScores.map((name) => (
            <ScoreItem key={name}>
              <ScoreLink to={`/e/${name}`}>{beautifySlug(name)}</ScoreLink>
            </ScoreItem>
          ))}
        </ScoresList>
      </ScoresContainer>
    </LandingContainer>
  );
};

export default EditorLandingPage;
