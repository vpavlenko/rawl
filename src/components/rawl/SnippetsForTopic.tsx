import React from "react";
import styled from "styled-components";
import { Snippet } from "./analysis";
import SnippetItem from "./SnippetItem";

const SnippetsForTopicContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 20px;
  padding-bottom: 10px;
`;

const SnippetItemWrapper = styled.div`
  flex: 0 0 auto;
  width: 400px;
`;

interface SnippetsForTopicProps {
  snippets: Snippet[];
  noteHeight?: number;
}

const SnippetsForTopic: React.FC<SnippetsForTopicProps> = ({
  snippets,
  noteHeight = 3,
}) => {
  return (
    <SnippetsForTopicContainer>
      {snippets.map((snippet, index) => (
        <SnippetItemWrapper key={index}>
          <SnippetItem
            snippet={snippet}
            index={index}
            noteHeight={noteHeight}
            isPreview={true}
          />
        </SnippetItemWrapper>
      ))}
    </SnippetsForTopicContainer>
  );
};

export default SnippetsForTopic;
