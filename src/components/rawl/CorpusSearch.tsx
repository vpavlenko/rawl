import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { corpora } from "./corpora/corpora";

interface CorpusSearchProps {
  onSearchChange: (term: string) => void;
}

const highlightMatch = (text: string, term: string) => {
  if (!term) return text;
  const regex = new RegExp(
    `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? <mark key={index}>{part}</mark> : part,
  );
};

const SearchContainer = styled.div`
  width: 40em;
  max-width: 100%;
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex-grow: 1;
  padding: 10px;
  box-sizing: border-box;
`;

const TotalCount = styled.span`
  margin-left: 10px;
  color: #888;
  font-size: 0.9em;
`;

const ResultsContainer = styled.div`
  width: 100%;
  height: 80vh;
  overflow-y: auto;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Column = styled.div`
  flex: 1;
  min-width: 33%;
  padding-right: 10px;
  box-sizing: border-box;
`;

const HighlightedResult = styled.div<{ isSelected: boolean }>`
  background-color: ${(props) =>
    props.isSelected ? "rgba(255, 255, 0, 0.4)" : "transparent"};
  padding: 0;
  margin: 2px 0;
`;

const CorpusSearch: React.FC<CorpusSearchProps> = ({ onSearchChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [totalMidis, setTotalMidis] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    const uniqueMidis = new Set(corpora.flatMap((corpus) => corpus.midis));
    setTotalMidis(uniqueMidis.size);
  }, []);

  const filteredCorpora = corpora.filter((corpus) => {
    if (searchTerm === "") return corpus.midis.length >= 1;

    const searchTerms = searchTerm.toLowerCase().split(/\s+/);
    const corpusWords = corpus.slug.toLowerCase().split(/[-_\s]+/);
    const midiWords = corpus.midis.flatMap((midi) =>
      midi.toLowerCase().split(/[-_\s]+/),
    );

    return searchTerms.every(
      (term) =>
        corpusWords.some((word) => word.includes(term)) ||
        midiWords.some((word) => word.includes(term)),
    );
  });

  const flattenedResults = React.useMemo(() => {
    return filteredCorpora.flatMap(({ slug, midis }) => [
      { type: "corpus", slug, url: `/corpus/${slug}` },
      ...midis.map((midi) => ({ type: "midi", midi, url: `/f/${midi}` })),
    ]);
  }, [filteredCorpora]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) =>
          (prev - 1 + flattenedResults.length) % flattenedResults.length,
      );
    } else if (e.key === "Enter" && selectedIndex !== -1) {
      e.preventDefault();
      const selected = flattenedResults[selectedIndex];
      window.open(selected.url, "_blank");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);
    onSearchChange(newTerm);
  };

  const renderEmptySearchResults = () => {
    const sortedCorpora = filteredCorpora.sort(
      (a, b) => b.midis.length - a.midis.length,
    );
    const columns = [[], [], []];
    sortedCorpora.forEach(({ slug, midis }, index) => {
      columns[index % 3].push(
        <div key={slug}>
          <Link to={`/corpus/${slug}`}>
            {slug.replace(/_/g, " ")}{" "}
            <span style={{ color: "white", fontSize: "0.6em" }}>
              {midis.length}
            </span>
          </Link>
        </div>,
      );
    });

    return (
      <ColumnContainer>
        {columns.map((column, index) => (
          <Column key={index}>{column}</Column>
        ))}
      </ColumnContainer>
    );
  };

  return (
    <SearchContainer onKeyDown={handleKeyDown}>
      <SearchInputContainer>
        <SearchInput
          ref={searchInputRef}
          type="text"
          placeholder="Search composers or songs, eg. 'nocturne', 'entertainer', 'jaws', 'autumn leaves'"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <TotalCount>{totalMidis} MIDIs</TotalCount>
      </SearchInputContainer>
      <ResultsContainer>
        {searchTerm === ""
          ? renderEmptySearchResults()
          : filteredCorpora.map(({ slug, midis }, corpusIndex) => {
              const searchTerms = searchTerm.toLowerCase().split(/\s+/);
              const composerMatched = searchTerms.every((term) =>
                slug
                  .toLowerCase()
                  .split(/[-_\s]+/)
                  .some((word) => word.includes(term)),
              );
              const matchingMidis = midis.filter((midi) =>
                searchTerms.every((term) =>
                  midi
                    .toLowerCase()
                    .split(/[-_\s]+/)
                    .some((word) => word.includes(term)),
                ),
              );

              return (
                <div
                  key={slug}
                  style={
                    composerMatched
                      ? {
                          borderLeft: "3px solid yellow",
                          paddingLeft: "10px",
                          marginBottom: "15px",
                        }
                      : {}
                  }
                >
                  <HighlightedResult isSelected={selectedIndex === corpusIndex}>
                    <Link to={`/corpus/${slug}`}>
                      {highlightMatch(slug.replace(/_/g, " "), searchTerm)}{" "}
                      <span style={{ color: "white", fontSize: "0.6em" }}>
                        {midis.length}
                      </span>
                    </Link>
                  </HighlightedResult>
                  {(composerMatched || searchTerm) &&
                    matchingMidis.map((midi, midiIndex) => (
                      <HighlightedResult
                        key={midi}
                        isSelected={
                          selectedIndex === corpusIndex + midiIndex + 1
                        }
                        style={{ paddingLeft: "20px" }}
                      >
                        <a
                          href={`/f/${midi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {highlightMatch(
                            midi.replace(/---/g, " – ").replace(/-/g, " "),
                            searchTerm,
                          )}
                        </a>
                      </HighlightedResult>
                    ))}
                </div>
              );
            })}
      </ResultsContainer>
    </SearchContainer>
  );
};

export default CorpusSearch;
