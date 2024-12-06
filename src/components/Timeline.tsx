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
  color: #fff;
  font-weight: bold;
`;

const ComposersGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ComposerCard = styled.span``;

const ComposerLink = styled(Link)`
  text-decoration: none;
  color: inherit;

  h3 {
    margin: 0 0 0.5rem 0;
    color: #fff;
  }
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
`;

const ComposerName = styled.h3`
  margin: 0;
  color: #fff;
`;

const Flags = styled.span`
  font-size: 1.2rem;
  //   padding-left: 10px;
  position: relative;
  top: -0.2em;
  left: -0.2em;
`;

const PieceCount = styled.span`
  font-size: 0.6em;
  position: relative;
  top: -0.6em;
  left: -0.2em;
  color: #666;
`;

const UnknownCountry = styled.span`
  font-size: 0.8em;
  color: #666;
  font-style: italic;
`;

const GenreList = styled.div`
  font-size: 0.7rem;
  color: #999;
  display: flex;
  flex-direction: column;
`;

const Timeline: React.FC = () => {
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

  const years = [...new Set(composers.map((c) => c.composerBirthYear))];

  const ComposerCardContent = ({ composer }: { composer: Composer }) => {
    const countries = composer.country?.split(",").map((c) => c.trim()) || [];
    const emojis = countries
      .map((c) => {
        if (c.toLowerCase() === "scotland") return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
        return flag(c);
      })
      .filter(Boolean);
    const unknown = countries.filter(
      (c) => c.toLowerCase() !== "scotland" && !flag(c),
    );

    const styles = getUniqueStyles(composer.genre, composer.style);
    const stylesList = styles.split(", ");

    return (
      <ComposerCard key={composer.slug}>
        <ComposerLink to={`/corpus/${composer.slug}`}>
          <ComposerHeader>
            <ComposerName>
              {composer.slug
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </ComposerName>
            {/* <PieceCount>{composer.midis.length}</PieceCount> */}
            {emojis.length > 0 && <Flags>{emojis.join(" ")}</Flags>}
            {unknown.length > 0 && (
              <UnknownCountry>({unknown.join(", ")})</UnknownCountry>
            )}
          </ComposerHeader>
        </ComposerLink>
        {stylesList.length > 0 && (
          <GenreList>
            {stylesList.map((style, index) => (
              <span key={index}>{style}</span>
            ))}
          </GenreList>
        )}
      </ComposerCard>
    );
  };

  return (
    <TimelineContainer>
      <h1>Composer Timeline</h1>
      <TimelineWrapper>
        {years.map((year) => (
          <TimelineYear key={year}>
            <YearMarker>
              <YearLabel>{year}</YearLabel>
            </YearMarker>
            <ComposersGroup>
              {composers
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
          <h2>Composers with Unknown Birth Year</h2>
          <ComposersGroup>
            {composersWithoutYear.map((composer) => (
              <ComposerCardContent key={composer.slug} composer={composer} />
            ))}
          </ComposersGroup>
        </>
      )}
    </TimelineContainer>
  );
};

export default Timeline;
