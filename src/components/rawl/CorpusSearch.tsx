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
  min-width: 0;
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
  text-align: left;
`;

const CountryGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CountryRow = styled.div`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
`;

const CountryFlag = styled.div`
  align-self: center;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  font-size: 30px;
  line-height: 1;

  > span {
    margin-right: 0;
  }
`;

const StylesLabel = styled.div`
  align-self: center;
  text-align: center;
  color: #999;
`;

const SingleComposerList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
`;

const SingleComposerRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;

  ${CountryFlag} {
    flex-shrink: 0;
    font-size: 24px;
  }
`;

const PieceCount = styled.span`
  color: #888;
  font-size: 0.8em;
  font-variant-numeric: tabular-nums;
`;

const ComposerLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 16px;
  min-width: 0;
`;

const ExpandButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  padding: 2px;
  border: 0;
  background: none;
  color: #999;
  font: inherit;
  cursor: pointer;

  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const INITIAL_COMPOSERS_PER_COUNTRY = 15;

const CorpusSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [expandedCountries, setExpandedCountries] = React.useState<
    Record<string, boolean>
  >({});
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
    const multiComposerGroups = sortedGroups.filter(
      ([country, entries]) => country === "Styles" || entries.length > 1,
    );
    const singleComposerGroups = sortedGroups
      .filter(([country, entries]) => country !== "Styles" && entries.length === 1)
      .sort((a, b) => b[1][0].midis.length - a[1][0].midis.length);

    return (
      <CountryGroups>
        {multiComposerGroups.map(([country, countryCorpora]) => {
          const expanded = !!expandedCountries[country];
          const collapsedCorpora =
            country === "Styles"
              ? countryCorpora.filter((corpus) => corpus.midis.length >= 5)
              : countryCorpora.slice(0, INITIAL_COMPOSERS_PER_COUNTRY);
          const visibleCorpora = expanded
            ? countryCorpora
            : collapsedCorpora;

          return (
            <CountryRow key={country}>
              {country === "Styles" ? (
                <StylesLabel>Styles</StylesLabel>
              ) : (
                <CountryFlag
                  role="img"
                  aria-label={country}
                  title={country}
                  style={{
                    justifyContent: "center",
                    fontSize: country.includes(",") ? 24 : undefined,
                  }}
                >
                  {getEmojis(country)}
                </CountryFlag>
              )}
              <ComposerLinks>
                {visibleCorpora.map(({ slug, midis }, index) => (
                  <Link key={`${slug}-${index}`} to={`/corpus/${slug}`}>
                    {formatComposerName(slug)}{" "}
                    <span style={{ fontSize: "0.6em", color: "gray" }}>
                      {midis.length}
                    </span>
                  </Link>
                ))}
                {!expanded && countryCorpora.length > collapsedCorpora.length && (
                  <ExpandButton
                    type="button"
                    aria-expanded={expanded}
                    aria-label={`Show more ${country === "Styles" ? "styles" : `composers from ${country}`}`}
                    title="Show more"
                    onClick={() =>
                      setExpandedCountries((previous) => ({
                        ...previous,
                        [country]: true,
                      }))
                    }
                  >
                    {/* Lucide chevrons-down icon. */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m7 6 5 5 5-5" />
                      <path d="m7 13 5 5 5-5" />
                    </svg>
                  </ExpandButton>
                )}
              </ComposerLinks>
            </CountryRow>
          );
        })}
        {singleComposerGroups.length > 0 && (
          <SingleComposerList>
            {singleComposerGroups.map(([country, [composer]]) => (
              <SingleComposerRow key={country}>
                <CountryFlag role="img" aria-label={country} title={country}>
                  {getEmojis(country)}
                </CountryFlag>
                <Link to={`/corpus/${composer.slug}`}>
                  {formatComposerName(composer.slug)}{" "}
                  <PieceCount aria-label={`${composer.midis.length} pieces`}>
                    {composer.midis.length}
                  </PieceCount>
                </Link>
              </SingleComposerRow>
            ))}
          </SingleComposerList>
        )}
      </CountryGroups>
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
