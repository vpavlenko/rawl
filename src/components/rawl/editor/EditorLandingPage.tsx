import { formatDistanceToNow } from "date-fns";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore/lite";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FirestoreEditDocument } from "../../../types/firestore";
import { AppContext } from "../../AppContext";
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
  flex-direction: row;
  padding: 50px 20px;
  margin-top: 30px;
  min-height: calc(100vh - 30px);
  box-sizing: border-box;
`;

// Two column layout
const LeftColumn = styled.div`
  flex: 1;
  margin-right: 20px;
  max-width: 350px;
`;

const RightColumn = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Styling for the user's scores
const UserScoresContainer = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;

// Styled components for the scores list
const ScoresContainer = styled.div`
  width: 100%;
  max-width: 600px;
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
  margin: 12px 0;
`;

const ScoreLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 16px;
  display: block;

  &:hover {
    text-decoration: underline;
  }
`;

const ScoreTimestamp = styled.span`
  color: #888;
  font-size: 12px;
  display: block;
  margin-top: 2px;
`;

const VersionBadge = styled.span`
  display: inline-block;
  background-color: transparent;
  color: #888;
  font-size: 11px;
  margin-left: 8px;
`;

interface UserScore {
  id: string;
  title: string;
  updatedAt: Date;
  versions: number;
}

const EditorLandingPage: React.FC = () => {
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const appContext = useContext(AppContext);
  const user = appContext?.user;

  // Hard-coded list of featured scores
  const featuredScores = [
    "schubert_d365_09",
    "Gravity_Falls_Opening",
    "passacaglia---handel-halvorsen",
    "papers-please",
    "idea-15---gibran-alcocer",
    "idea-n.10---gibran-alcocer",
  ];

  // Fetch user scores when component mounts and user is available
  useEffect(() => {
    const fetchUserScores = async () => {
      if (!user) {
        setUserScores([]);
        return;
      }

      try {
        const db = getFirestore();
        const editsCollection = collection(db, "edits");
        const q = query(editsCollection, where("owner", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const scores: UserScore[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as FirestoreEditDocument;
          scores.push({
            id: doc.id,
            title: data.title || "",
            updatedAt: data.updatedAt?.toDate() || new Date(),
            versions: data.versions?.length || 0,
          });
        });

        // Sort by most recently updated
        scores.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        setUserScores(scores);
      } catch (error) {
        console.error("Error fetching user scores:", error);
      }
    };

    fetchUserScores();
  }, [user]);

  return (
    <LandingContainer>
      <LeftColumn>
        {user && (
          <UserScoresContainer>
            <ScoresTitle>My Scores</ScoresTitle>
            <ScoresList>
              {userScores.length > 0 ? (
                userScores.map((score) => (
                  <ScoreItem key={score.id}>
                    <ScoreLink to={`/ef/${score.id}/${score.versions}`}>
                      {score.title || score.id}
                      <VersionBadge>v{score.versions}</VersionBadge>
                    </ScoreLink>
                    <ScoreTimestamp>
                      {formatDistanceToNow(score.updatedAt, {
                        addSuffix: true,
                      })}
                    </ScoreTimestamp>
                  </ScoreItem>
                ))
              ) : (
                <ScoreItem>No saved scores yet</ScoreItem>
              )}
            </ScoresList>
          </UserScoresContainer>
        )}
        <StyledButtonLink to="/e/new">New Score</StyledButtonLink>
      </LeftColumn>

      <RightColumn>
        <ScoresContainer>
          <ScoresTitle>Examples</ScoresTitle>
          <ScoresList>
            {featuredScores.map((name) => (
              <ScoreItem key={name}>
                <ScoreLink to={`/e/${name}`}>{beautifySlug(name)}</ScoreLink>
              </ScoreItem>
            ))}
          </ScoresList>
        </ScoresContainer>
      </RightColumn>
    </LandingContainer>
  );
};

export default EditorLandingPage;
