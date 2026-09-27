import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { AppContext } from "./AppContext";
import { SearchResultsContext } from "./SearchContext";
import CorpusSearch from "./rawl/CorpusSearch";
import { Directory } from "./lakh/Lakh";
import { LakhCatalog, loadLakhCatalog } from "./lakh/catalog";

const Results = styled.div`
  box-sizing: border-box;
  min-height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  padding: 24px;
  color: #ddd;
  > section {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  > section:last-child {
    display: flex;
    flex-direction: column;
    > * {
      flex-shrink: 0;
    }
  }
  h2 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: normal;
  }
  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: min-content 1fr;
  }
`;

const SearchResults = React.memo(function SearchResults({
  query,
}: {
  query: string;
}) {
  const { analyses, annotationVersions } = useContext(AppContext);
  const [catalog, setCatalog] = useState<LakhCatalog | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setError(false);
    loadLakhCatalog().then(
      (data) => {
        if (active) setCatalog(data);
      },
      () => {
        if (active) setError(true);
      },
    );
    return () => {
      active = false;
    };
  }, [retry]);

  return (
    <Results aria-label="Search results">
      <section aria-label="Pieces">
        <h2>Pieces</h2>
        <CorpusSearch query={query} />
      </section>
      <section aria-label="Lakh">
        {error ? (
          <p role="alert">
            Could not load Lakh.{" "}
            <button onClick={() => setRetry((value) => value + 1)}>
              Retry
            </button>
          </p>
        ) : catalog ? (
          <Directory
            catalog={catalog}
            analyses={analyses}
            annotationVersions={annotationVersions}
            query={query}
          />
        ) : (
          <p role="status">Loading Lakh…</p>
        )}
      </section>
    </Results>
  );
});

export const SearchContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const query = useContext(SearchResultsContext);
  const searching = !!query.trim();
  const pageRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const container = pageRef.current?.parentElement;
    if (!searching || !container) return;
    const scrollTop = container.scrollTop;
    container.scrollTop = 0;
    return () => {
      container.scrollTop = scrollTop;
    };
  }, [searching]);
  return (
    <>
      <div ref={pageRef} style={{ display: searching ? "none" : "contents" }}>
        {children}
      </div>
      {searching && <SearchResults query={query.trim()} />}
    </>
  );
};
