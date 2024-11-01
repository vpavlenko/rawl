import * as React from "react";
import { useContext } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import CorpusList from "../corpora/CorpusList";
import SnippetsForTopic from "../SnippetsForTopic";

const TopicContainer = styled.div`
  margin: 0;
  padding: 20px 0;
`;

const TopicCard = styled.div`
  background-color: #000000;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const ClickableContainer = styled.div`
  cursor: pointer;
`;

const MidiButton = styled.button`
  display: block;
  padding: 3px 0;
  font-size: 14px;
  color: #ffffff;
  text-decoration: none;
  word-wrap: break-word;
  padding-left: 1em;
  text-indent: -1em;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  &:hover {
    color: #4a90e2;
  }
`;

const CMajorHarmony = () => {
  const { analyses, handleSongClick } = useContext(AppContext);

  // Helper function to get snippets for a specific topic
  const getSnippetsForTopic = (targetTag: string) => {
    const snippets = [];
    for (const [path, analysis] of Object.entries(analyses)) {
      if (analysis.snippets) {
        for (const snippet of analysis.snippets) {
          if (snippet.tag === targetTag) {
            snippets.push({
              snippet,
              slug: path.startsWith("f/") ? path.slice(2) : path,
            });
          }
        }
      }
    }
    return snippets;
  };

  const lastISnippets = getSnippetsForTopic("book:1_1_I_last");

  const formatSlug = (slug: string) => {
    return slug.replace(/---/g, " – ").replace(/-/g, " ").replace(/_/g, " ");
  };

  return (
    <div>
      <h1>C Major Harmony</h1>
      <p>This chapter explores harmony in the key of C major...</p>
      <p>Here we analyze the corpus chapters_c_major:</p>
      <CorpusList slug="chapters_c_major" />
      <p>
        First, let's notice which chords are in there. Each piece ends with the
        same chord:
      </p>

      <TopicContainer>
        <TopicCard>
          {lastISnippets.map(({ snippet, slug }, index) => (
            <ClickableContainer
              key={index}
              onClick={() => handleSongClick(slug)}
            >
              <MidiButton>{formatSlug(slug)}</MidiButton>
              <SnippetsForTopic snippets={[snippet]} noteHeight={3} />
            </ClickableContainer>
          ))}
        </TopicCard>
      </TopicContainer>
    </div>
  );
};

export default CMajorHarmony;
