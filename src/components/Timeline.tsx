import { flag } from "country-emoji";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { corpora } from "./rawl/corpora/corpora";

const TimelineContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const TimelineWrapper = styled.div`
  position: relative;
  padding-left: 100px;

  &::before {
    content: "";
    position: absolute;
    left: 80px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #666;
  }
`;

const TimelineYear = styled.div`
  position: relative;
  margin-bottom: 2rem;
`;

const YearMarker = styled.div`
  position: absolute;
  left: -100px;
  width: 80px;
  text-align: right;
`;

const YearLabel = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  position: relative;
  top: 0.2rem;
  color: #999;
  font-weight: bold;
`;

const ComposersGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ComposerCard = styled.div`
  cursor: default;
  font-size: 0.9rem;
`;

const ComposerLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: inline-block;
`;

type Composer = {
  slug: string;
  midis: string[];
  composerBirthYear?: number;
  genre?: string;
  style?: string;
  country?: string;
};

const ComposerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  > a {
    flex: 0 1 auto;
  }
`;

const ComposerName = styled.h3`
  margin: 0;
  color: #fff;
`;

const Flags = styled.span`
  font-size: 1.2rem;
  //   padding-left: 10px;
  position: relative;
  left: -0.2em;
`;

const GenreList = styled.div`
  font-size: 0.7rem;
  color: #999;
  display: flex;
  flex-direction: column;
`;

const GenreItem = styled.span`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;

const FilterIndicator = styled.div`
  position: fixed;
  top: 50px;
  right: 20px;
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

const CountryFlag = styled.span`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const getEmojis = (
  country: string,
  onCountryClick: (country: string) => void,
): React.ReactNode[] => {
  const countries = country?.split(",").map((c) => c.trim()) || [];
  return countries
    .map((c) => (
      <CountryFlag onClick={() => onCountryClick(c)} key={c}>
        <Flags>{flag(c)}</Flags>
      </CountryFlag>
    ))
    .filter(Boolean);
};

const Timeline: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = React.useState<string | null>(
    null,
  );
  const [selectedStyle, setSelectedStyle] = React.useState<string | null>(null);

  const getUniqueStyles = (genre?: string, style?: string) => {
    const styles = new Set<string>();

    if (genre) {
      genre
        .split(",")
        .map((s) => s.trim())
        .forEach((s) => styles.add(s));
    }
    if (style) {
      style
        .split(",")
        .map((s) => s.trim())
        .forEach((s) => styles.add(s));
    }

    return Array.from(styles).join(", ");
  };

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

  const filteredComposers = composers.filter((composer) => {
    if (selectedCountry) {
      return composer.country
        ?.split(",")
        .map((c) => c.trim())
        .includes(selectedCountry);
    }
    if (selectedStyle) {
      const styles = getUniqueStyles(composer.genre, composer.style).split(
        ", ",
      );
      return styles.includes(selectedStyle);
    }
    return true;
  });

  const filteredYears = [
    ...new Set(filteredComposers.map((c) => c.composerBirthYear)),
  ];

  const ComposerCardContent = ({ composer }: { composer: Composer }) => {
    const styles = getUniqueStyles(composer.genre, composer.style);
    const stylesList = styles.split(", ");

    return (
      <ComposerCard key={composer.slug}>
        <ComposerHeader>
          <ComposerLink to={`/corpus/${composer.slug}`}>
            <ComposerName>
              {composer.slug
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </ComposerName>
          </ComposerLink>
          <div>{getEmojis(composer.country, handleCountryClick)}</div>
        </ComposerHeader>
        {stylesList.length > 0 && (
          <GenreList>
            {stylesList.map((style, index) => (
              <GenreItem key={index} onClick={() => handleStyleClick(style)}>
                {style}
              </GenreItem>
            ))}
          </GenreList>
        )}
      </ComposerCard>
    );
  };

  return (
    <TimelineContainer>
      <span style={{ color: "#999", marginBottom: 40 }}>
        All years are approximate composer birth years.
      </span>
      {(selectedCountry || selectedStyle) && (
        <FilterIndicator>
          <span>
            {selectedCountry && (
              <>
                {selectedCountry} {flag(selectedCountry)}
              </>
            )}
            {selectedStyle && selectedStyle}
          </span>
          <CloseFilter onClick={clearFilter}>×</CloseFilter>
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
      {composersWithoutYear.length > 0 && (
        <>
          <ComposersGroup>
            {composersWithoutYear
              .filter((composer) => {
                if (selectedCountry) {
                  return composer.country
                    ?.split(",")
                    .map((c) => c.trim())
                    .includes(selectedCountry);
                }
                if (selectedStyle) {
                  const styles = getUniqueStyles(
                    composer.genre,
                    composer.style,
                  ).split(", ");
                  return styles.includes(selectedStyle);
                }
                return true;
              })
              .map((composer) => (
                <ComposerCardContent key={composer.slug} composer={composer} />
              ))}
          </ComposersGroup>
        </>
      )}
    </TimelineContainer>
  );
};

export default Timeline;
