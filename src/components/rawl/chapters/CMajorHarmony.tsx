import * as React from "react";
import { useContext } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import CorpusList from "../corpora/CorpusList";
import InlineRawlPlayer from "../InlineRawlPlayer";
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

const SnippetList = ({ slug }) => {
  const { analyses, handleSongClick, resetMidiPlayerState } =
    useContext(AppContext);

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

  const snippets = getSnippetsForTopic(slug);

  const formatSlug = (slug: string) => {
    return slug.replace(/---/g, " – ").replace(/-/g, " ").replace(/_/g, " ");
  };

  const handleSnippetClick = (slug: string, measureStart: number) => {
    resetMidiPlayerState();
    handleSongClick(slug);
  };

  return (
    <>
      <h1>{slug.replace("book:1_1_", "")}</h1>
      <TopicContainer>
        <TopicCard>
          {snippets.map(({ snippet, slug }, index) => (
            <ClickableContainer
              key={index}
              onClick={() => handleSnippetClick(slug, snippet.measuresSpan[0])}
            >
              <MidiButton>{formatSlug(slug)}</MidiButton>
              <SnippetsForTopic snippets={[snippet]} noteHeight={3} />
            </ClickableContainer>
          ))}
        </TopicCard>
      </TopicContainer>
    </>
  );
};
const CMajorHarmony = () => {
  return (
    <InlineRawlPlayer>
      <div>
        <h1>C Major Harmony</h1>
        <p>This chapter explores harmony in the key of C major...</p>
        <p>Here we analyze the corpus chapters_c_major:</p>
        <CorpusList slug="chapters_c_major" />
        <p>
          First, let's notice which chords are in there. Each piece ends with
          the same chord:
        </p>
        <SnippetList slug="book:1_1_I_last" />

        <p>Also, all the pieces share several other chords:</p>
        <SnippetList slug="book:1_1_I" />
        <SnippetList slug="book:1_1_IV" />
        <SnippetList slug="book:1_1_V" />
        <SnippetList slug="book:1_1_ii" />
        <SnippetList slug="book:1_1_major_II" />
        <SnippetList slug="book:1_1_vi_iii" />
      </div>
    </InlineRawlPlayer>
  );
};

export default CMajorHarmony;
