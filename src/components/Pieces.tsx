import React from "react";
import styled from "styled-components";
import Timeline from "./Timeline";
import CorpusSearch from "./rawl/CorpusSearch";

const PiecesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 32px;
  padding: 24px 24px 80px;

  > section {
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;

const Pieces: React.FC = () => (
  <PiecesContainer>
    <section aria-label="Pieces">
      <CorpusSearch />
    </section>
    <section aria-label="Timeline">
      <Timeline />
    </section>
  </PiecesContainer>
);

export default Pieces;
