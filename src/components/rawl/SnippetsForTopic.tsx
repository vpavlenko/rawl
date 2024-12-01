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
  flex: 1 1 auto; // Allow the item to grow and shrink
  min-width: 0; // Ensure the item can shrink below its content width
  max-width: 100%; // Ensure the item does not exceed the container width
  box-sizing: border-box; // Include padding and border in the element's total width and height
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
          />
        </SnippetItemWrapper>
      ))}
    </SnippetsForTopicContainer>
  );
};

export default SnippetsForTopic;
