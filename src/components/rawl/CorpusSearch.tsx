import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { corpora } from "./corpora/corpora";
import { formatComposerName, getEmojis } from "./corpusUtils";
import { TOP_100_COMPOSERS } from "./top100Composers";

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

// Get nice name for a MIDI slug if it exists in TOP_100_COMPOSERS
const getNiceName = (slug: string) => {
  const composerInfo = TOP_100_COMPOSERS.find(
    (composer) => composer.slug === slug,
  );
  if (composerInfo) {
    return `${composerInfo.composer} - ${composerInfo.displayTitle}`;
  }
  return slug.replace(/---/g, " – ").replace(/-/g, " ").replace(/_/g, " ");
};

const SearchContainer = styled.div`
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
  text-align: left;
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

    // Include nice names in the search for midis
    const midiWords = corpus.midis.flatMap((midi) => {
      const niceName = getNiceName(midi).toLowerCase();
      return [...midi.toLowerCase().split(/[-_\s]+/), ...niceName.split(/\s+/)];
    });

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

    // Group corpora by country
    const groupedCorpora = sortedCorpora.reduce(
      (acc, corpus) => {
        const group = corpus.country || "Styles";
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(corpus);
        return acc;
      },
      {} as Record<string, typeof corpora>,
    );

    // Sort countries by number of corpora (not pieces)
    const sortedGroups = Object.entries(groupedCorpora).sort((a, b) => {
      if (a[0] === "Styles") return -1;
      if (b[0] === "Styles") return 1;
      return b[1].length - a[1].length;
    });

    // Separate single-corpus countries
    const multiCorpusGroups = sortedGroups.filter(
      ([country, corpora]) => corpora.length > 1 || country === "Styles",
    );
    const singleCorpusEntries = sortedGroups
      .filter(
        ([country, corpora]) => corpora.length === 1 && country !== "Styles",
      )
      .flatMap(([country, corpora]) =>
        corpora.map((corpus) => ({ country, corpus })),
      )
      .sort((a, b) => b.corpus.midis.length - a.corpus.midis.length);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
        {/* Multi-corpus countries */}
        {multiCorpusGroups.map(([country, corpora]) => (
          <div key={country} style={{ textAlign: "left" }}>
            <h3 style={{ marginBottom: "10px" }}>
              {country} {country !== "Styles" && getEmojis(country)}
              <span
                style={{
                  fontSize: "0.6em",
                  color: "gray",
                  marginLeft: "8px",
                }}
              >
                {corpora.reduce((sum, corpus) => sum + corpus.midis.length, 0)}
              </span>
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {corpora.map(({ slug, midis }) => (
                <div key={slug} style={{ marginRight: "20px" }}>
                  <Link to={`/corpus/${slug}`}>
                    {formatComposerName(slug)}{" "}
                    <span style={{ fontSize: "0.6em", color: "gray" }}>
                      {midis.length}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Single-corpus countries */}
        {singleCorpusEntries.length > 0 && (
          <div style={{ textAlign: "left" }}>
            <h3 style={{ marginBottom: "10px" }}>Single Composers</h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "center",
              }}
            >
              {singleCorpusEntries.map(({ country, corpus }) => (
                <div
                  key={corpus.slug}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "200px",
                  }}
                >
                  {getEmojis(country)}
                  <Link to={`/corpus/${corpus.slug}`}>
                    {formatComposerName(corpus.slug)}
                    <span
                      style={{
                        fontSize: "0.6em",
                        color: "gray",
                      }}
                    >
                      {corpus.midis.length}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <SearchContainer>
      <SearchInputContainer>
        <SearchInput
          ref={searchInputRef}
          type="text"
          placeholder="Search composers or songs, eg. 'nocturne', 'entertainer', 'jaws', 'autumn leaves', 'succession', 'bts', 'chopin', 'mario'"
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

              // Update the matching logic to also check nice names
              const matchingMidis = midis.filter((midi) => {
                const niceName = getNiceName(midi).toLowerCase();
                const niceNameWords = niceName.split(/\s+/);

                return searchTerms.every(
                  (term) =>
                    midi
                      .toLowerCase()
                      .split(/[-_\s]+/)
                      .some((word) => word.includes(term)) ||
                    niceNameWords.some((word) => word.includes(term)),
                );
              });

              return (
                <div
                  key={slug}
                  style={{
                    borderLeft: composerMatched ? "3px solid yellow" : "none",
                    paddingLeft: composerMatched ? "10px" : "0",
                    marginBottom: "15px",
                    textAlign: "left",
                  }}
                >
                  <Link to={`/corpus/${slug}`}>
                    {highlightMatch(slug.replace(/_/g, " "), searchTerm)}{" "}
                    <span style={{ color: "white", fontSize: "0.6em" }}>
                      {midis.length}
                    </span>
                  </Link>
                  {(composerMatched || searchTerm) &&
                    matchingMidis.map((midi) => (
                      <div
                        key={`${slug}_${midi}`}
                        style={{ paddingLeft: "20px" }}
                      >
                        <a
                          href={`/f/${midi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {highlightMatch(getNiceName(midi), searchTerm)}
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
