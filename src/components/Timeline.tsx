import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { corpora } from "./rawl/corpora/corpora";
import {
  formatComposerName,
  getEmojis,
  getUniqueStyles,
  HasMetadata,
} from "./rawl/corpusUtils";

const TimelineContainer = styled.div`
  min-width: 0;
`;

const TimelineWrapper = styled.div`
  position: relative;
  padding-left: 78px;

  &::before {
    content: "";
    position: absolute;
    left: 60px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #333;
  }
`;

const TimelineYear = styled.div`
  position: relative;
  padding: 0 0 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #202020;

  &::before {
    content: "";
    position: absolute;
    left: -21px;
    top: 7px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #888;
    box-shadow: 0 0 0 3px black;
  }

  &:last-child {
    margin-bottom: 0;
    border-bottom: 0;
  }
`;

const YearMarker = styled.div`
  position: absolute;
  left: -78px;
  width: 48px;
  text-align: right;
`;

const YearLabel = styled.span`
  color: #bbb;
  font-size: 13px;
  line-height: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const ComposersGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  gap: 12px 20px;
`;

const ComposerCard = styled.div`
  cursor: default;
  min-width: 0;
`;

const ComposerLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: inline-block;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

type Composer = HasMetadata & {
  slug: string;
  midis: string[];
};

const ComposerHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;

  > a {
    flex: 0 1 auto;
  }
`;

const ComposerName = styled.h3`
  margin: 0;
  color: #eee;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  overflow-wrap: anywhere;
`;

const CountryFlag = styled.button`
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const ComposerStyles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0 6px;
  margin-top: 0;
`;

const StyleFilter = styled.button`
  padding: 0;
  border: 0;
  background: none;
  color: #777;
  font: inherit;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 15px;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const UndatedHeading = styled.h3`
  margin: 24px 0 16px;
  padding-top: 16px;
  border-top: 1px solid #333;
  color: #aaa;
  font-size: 14px;
  font-weight: 500;
`;

const FilterIndicator = styled.div`
  margin-bottom: 24px;
  padding: 8px 16px;
  border-radius: 4px;
  background: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseFilter = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  font-size: 1.2rem;

  &:hover {
    opacity: 0.8;
  }
`;

const Timeline: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = React.useState<string | null>(
    null,
  );
  const [selectedStyle, setSelectedStyle] = React.useState<string | null>(null);

  const composers = corpora
    .filter(
      (composer): composer is Composer & { composerBirthYear: number } =>
        typeof composer.composerBirthYear === "number",
    )
    .sort((a, b) => b.composerBirthYear - a.composerBirthYear);

  const composersWithoutYear = corpora.filter(
    (composer) => typeof composer.composerBirthYear !== "number",
  );

  const handleCountryClick = (country: string) => {
    setSelectedStyle(null);
    setSelectedCountry(country);
  };

  const handleStyleClick = (style: string) => {
    setSelectedCountry(null);
    setSelectedStyle(style);
  };

  const clearFilter = () => {
    setSelectedCountry(null);
    setSelectedStyle(null);
  };

  const matchesFilter = (composer: Composer) => {
    if (selectedCountry) {
      return composer.country
        ?.split(",")
        .map((c) => c.trim())
        .includes(selectedCountry);
    }
    if (selectedStyle) {
      const styles = getUniqueStyles(composer.genre, composer.style);
      return styles.includes(selectedStyle);
    }
    return true;
  };

  const filteredComposers = composers.filter(matchesFilter);
  const filteredComposersWithoutYear = composersWithoutYear.filter(matchesFilter);

  const filteredYears = [
    ...new Set(filteredComposers.map((c) => c.composerBirthYear)),
  ];

  const ComposerCardContent = ({ composer }: { composer: Composer }) => {
    const styles = getUniqueStyles(composer.genre, composer.style);

    return (
      <ComposerCard key={composer.slug}>
        <ComposerHeader>
          <ComposerLink to={`/corpus/${composer.slug}`}>
            <ComposerName>{formatComposerName(composer.slug)}</ComposerName>
          </ComposerLink>
          {composer.country && (
            <div>
              {composer.country.split(",").map((c) => (
                <CountryFlag
                  key={c.trim()}
                  type="button"
                  aria-label={`Filter by ${c.trim()}`}
                  title={`Filter by ${c.trim()}`}
                  onClick={() => handleCountryClick(c.trim())}
                >
                  {getEmojis(c.trim())}
                </CountryFlag>
              ))}
            </div>
          )}
        </ComposerHeader>
        {styles.length > 0 && (
          <ComposerStyles>
            {styles.map((style, index) => (
              <StyleFilter
                key={index}
                type="button"
                onClick={() => handleStyleClick(style)}
              >
                {index === styles.length - 1 ? style : `${style},`}
              </StyleFilter>
            ))}
          </ComposerStyles>
        )}
      </ComposerCard>
    );
  };

  return (
    <TimelineContainer>
      <div
        style={{
          color: "#999",
          marginBottom: 24,
          textAlign: "right",
          fontSize: 12,
        }}
      >
        All years are approximate composer birth years.
      </div>
      {(selectedCountry || selectedStyle) && (
        <FilterIndicator>
          <span>
            {selectedCountry && (
              <>
                {selectedCountry} {getEmojis(selectedCountry)}
              </>
            )}
            {selectedStyle && selectedStyle}
          </span>
          <CloseFilter onClick={clearFilter} aria-label="Clear filter">
            ×
          </CloseFilter>
        </FilterIndicator>
      )}
      <TimelineWrapper>
        {filteredYears.map((year) => (
          <TimelineYear key={year}>
            <YearMarker>
              <YearLabel>{year}</YearLabel>
            </YearMarker>
            <ComposersGroup>
              {filteredComposers
                .filter((composer) => composer.composerBirthYear === year)
                .map((composer) => (
                  <ComposerCardContent
                    key={composer.slug}
                    composer={composer}
                  />
                ))}
            </ComposersGroup>
          </TimelineYear>
        ))}
      </TimelineWrapper>
      {filteredComposersWithoutYear.length > 0 && (
        <>
          <UndatedHeading>Without a birth year</UndatedHeading>
          <ComposersGroup>
            {filteredComposersWithoutYear.map((composer) => (
                <ComposerCardContent key={composer.slug} composer={composer} />
              ))}
          </ComposersGroup>
        </>
      )}
    </TimelineContainer>
  );
};

export default Timeline;
