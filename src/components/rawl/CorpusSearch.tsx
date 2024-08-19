import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { corpora } from "./corpora/corpora";

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
  height: 400px;
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

const CorpusSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const totalMidis = corpora.reduce(
    (sum, corpus) => sum + corpus.midis.length,
    0,
  );

  const filteredCorpora = corpora.filter(
    (corpus) =>
      (searchTerm === "" ? corpus.midis.length >= 1 : true) &&
      (corpus.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        corpus.midis.some((midi) =>
          midi.toLowerCase().includes(searchTerm.toLowerCase()),
        )),
  );

  const renderEmptySearchResults = () => {
    const columns = [[], [], []];
    filteredCorpora.forEach(({ slug, midis }, index) => {
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
    <SearchContainer>
      <SearchInputContainer>
        <SearchInput
          ref={searchInputRef}
          type="text"
          placeholder="Search composers or songs, eg. 'nocturne', 'entertainer', 'jaws', 'autumn leaves'"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TotalCount>{totalMidis} MIDIs</TotalCount>
      </SearchInputContainer>
      <ResultsContainer>
        {searchTerm === ""
          ? renderEmptySearchResults()
          : filteredCorpora.map(({ slug, midis }) => {
              const composerMatched = slug
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
              const matchingMidis = midis.filter((midi) =>
                midi.toLowerCase().includes(searchTerm.toLowerCase()),
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
                  <Link to={`/corpus/${slug}`}>
                    {highlightMatch(slug.replace(/_/g, " "), searchTerm)}{" "}
                    <span style={{ color: "white", fontSize: "0.6em" }}>
                      {midis.length}
                    </span>
                  </Link>
                  {(composerMatched || searchTerm) &&
                    matchingMidis.map((midi) => (
                      <div key={midi} style={{ paddingLeft: "20px" }}>
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
                      </div>
                    ))}
                </div>
              );
            })}
      </ResultsContainer>
    </SearchContainer>
  );
};

export default CorpusSearch;
