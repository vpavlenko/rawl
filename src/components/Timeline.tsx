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
  background: #333;
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
  font-weight: bold;
`;

const ComposersGroup = styled.div`
  padding-left: 2rem;
`;

const ComposerCard = styled.div`
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(5px);
  }
`;

const ComposerLink = styled(Link)`
  text-decoration: none;
  color: inherit;

  h3 {
    margin: 0 0 0.5rem 0;
    color: #fff;
  }
`;

const ComposerDetails = styled.div`
  font-size: 0.9rem;
  color: #999;

  p {
    margin: 0.25rem 0;
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

const Timeline: React.FC = () => {
  const composers = corpora
    .filter(
      (composer): composer is Composer & { composerBirthYear: number } =>
        typeof composer.composerBirthYear === "number",
    )
    .sort((a, b) => b.composerBirthYear - a.composerBirthYear);

  const years = [...new Set(composers.map((c) => c.composerBirthYear))];

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
                  <ComposerCard key={composer.slug}>
                    <ComposerLink to={`/corpus/${composer.slug}`}>
                      <h3>
                        {composer.slug
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </h3>
                    </ComposerLink>
                    <ComposerDetails>
                      {composer.country && <p>Country: {composer.country}</p>}
                      {composer.genre && <p>Genre: {composer.genre}</p>}
                      {composer.style && <p>Style: {composer.style}</p>}
                      <p>Number of pieces: {composer.midis.length}</p>
                    </ComposerDetails>
                  </ComposerCard>
                ))}
            </ComposersGroup>
          </TimelineYear>
        ))}
      </TimelineWrapper>
    </TimelineContainer>
  );
};

export default Timeline;
