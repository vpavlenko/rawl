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
  const [totalMidis, setTotalMidis] = React.useState(0);

  React.useEffect(() => {
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
