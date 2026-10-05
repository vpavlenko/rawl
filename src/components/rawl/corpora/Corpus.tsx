import * as React from "react";
import styled from "styled-components";
import { stripComposerFromTitle } from "./pieceTitle";
import { AppContext } from "../../AppContext";
import { filterSnippetsByAccess, getSnippetTags } from "../analysis";
import { ComposerTitle } from "../book/Book";
import { TOP_100_COMPOSERS, type Top100Composer } from "../top100Composers";
import { corpora } from "./corpora";
import { getCorpusSections } from "./corpusSections";
import { getComposerInfo as getCorpusComposerInfo } from "./composerInfo";
import ComposerBirthYearTimeline from "./ComposerBirthYearTimeline";
import { beautifySlug } from "./utils";
import { formatComposerName } from "../corpusUtils";
import { getSimpleMajorPopularPicks } from "./simpleMajorPopularPieces";
import simpleMajorLakhPieces from "./simpleMajorLakhPieces.json";
import simpleMajorLakhPopularPieces from "./simpleMajorLakhPopularPieces.json";
import BeatlesDiscography from "../../lakh/BeatlesDiscography";
import LakhEntry from "../../lakh/LakhEntry";
import { lakhAnalysisKey } from "../../lakh/catalog";
import { ADMIN_USER_ID } from "../../annotationVersions";

const PieceLink = styled.a<{
  $hasOrder: boolean;
}>`
  text-decoration: ${({ $hasOrder }) => ($hasOrder ? "line-through" : "none")};
  &,
  &:visited {
    color: ${({ $hasOrder }) => ($hasOrder ? "gray" : "#ffaa00")};
  }
`;

const ComposerColumns = styled.div`
  columns: 300px;
  column-gap: 24px;
  > div {
    break-inside: avoid;
    margin-bottom: 16px;
    padding-top: 1px;
  }
`;

const StageColumns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 32px;
  > div {
    min-width: 0;
  }
  > div + div {
    border-left: 1px solid #333;
    padding-left: 24px;
  }
  h3[data-source-heading] {
    color: #999;
    font-size: 0.9em;
    font-weight: normal;
    margin: 0 0 16px;
  }
  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
    > div + div {
      border-left: none;
      border-top: 1px solid #333;
      padding: 20px 0 0;
    }
  }
`;

interface ComposerInfo {
  slug: string;
  composer: string;
  order?: number;
}

const Corpus: React.FC<{
  slug: string;
  composers?: ComposerInfo[];
}> = ({ slug, composers }) => {
  const { analyses, annotationVersions } = React.useContext(AppContext);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(
    null,
  );
  const [focusedCategory, setFocusedCategory] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const getTagsForMidi = (midiSlug: string) => {
    const analysis = analyses[`f/${midiSlug}`];
    if (analysis) {
      const filteredAnalysis = {
        ...analysis,
        snippets: filterSnippetsByAccess(analysis.snippets || []),
      };
      const tags = getSnippetTags(filteredAnalysis);
      return tags.length > 0 ? tags : null;
    }
    return null;
  };

  const getComposerOrder = (midiSlug: string) => {
    if (!composers) return undefined;
    const composer = composers.find((c) => c.slug === midiSlug);
    return composer?.order;
  };

  const getComposerInfo = (midiSlug: string): Top100Composer | undefined => {
    return TOP_100_COMPOSERS.find((c) => c.slug === midiSlug);
  };

  const corpus = corpora.filter((corpus) => corpus.slug === slug)?.[0];
  if (!corpus) {
    return <div>Corpus {slug} not found</div>;
  }
  const sections = getCorpusSections(corpus);
  const lakhPieces = (sectionId: string) =>
    slug === "simple_major"
      ? (
          simpleMajorLakhPieces as Record<
            string,
            { artist: string; title: string; slug: string; filename: string }[]
          >
        )[sectionId] || []
      : [];
  const stageCount = (section: (typeof sections)[number]) =>
    section.count + lakhPieces(section.id).length;
  const renderLakhPopularStar = (
    sectionId: string,
    artist: string,
    title: string,
  ) => {
    const picks =
      (simpleMajorLakhPopularPieces as Record<string, string[][]>)[sectionId] ||
      [];
    if (!picks.some(([name, song]) => name === artist && song === title))
      return null;
    return (
      <span
        data-lakh-popular
        aria-hidden="true"
        title="Popular pick · curated for broad recognition"
        style={{
          color: sections.find((s) => s.id === sectionId)?.color,
          marginRight: "6px",
          fontSize: "0.8em",
        }}
      >
        ★
      </span>
    );
  };
  const popularPicks = new Map(
    slug === "simple_major"
      ? sections.map(
          (section) =>
            [
              section.id,
              getSimpleMajorPopularPicks(
                section.id,
                corpus.midis.slice(
                  section.startIndex,
                  section.startIndex + section.count,
                ),
              ),
            ] as const,
        )
      : [],
  );

  const composerName = (midiSlug: string) => {
    const credit = getComposerInfo(midiSlug);
    const composer = getCorpusComposerInfo(midiSlug);
    return (
      credit?.composer ||
      (composer &&
        (composer.composerName || formatComposerName(composer.slug))) ||
      "Unknown composer"
    );
  };
  const pieceTitle = (midiSlug: string) => {
    const composer = getCorpusComposerInfo(midiSlug);
    return stripComposerFromTitle(
      getComposerInfo(midiSlug)?.displayTitle || beautifySlug(midiSlug),
      [
        composerName(midiSlug),
        composer
          ? composer.composerName || formatComposerName(composer.slug)
          : "",
      ],
    );
  };
  type DisplayRow = {
    midiSlug: string;
    section?: (typeof sections)[number];
    composerHeading?: string;
    sectionId?: string;
  };
  const rows: DisplayRow[] = [];
  if (corpus.showComposerTimeline && sections.length) {
    for (const section of sections) {
      const groups = new Map<string, string[]>();
      corpus.midis
        .slice(section.startIndex, section.startIndex + section.count)
        .forEach((midiSlug) => {
          const name = composerName(midiSlug);
          groups.set(name, [...(groups.get(name) || []), midiSlug]);
        });
      [...groups]
        .sort(
          ([a], [b]) =>
            Number(a === "Unknown composer") -
              Number(b === "Unknown composer") || a.localeCompare(b),
        )
        .forEach(([name, midis], groupIndex) => {
          midis.forEach((midiSlug, index) =>
            rows.push({
              midiSlug,
              sectionId: section.id,
              ...(index === 0 ? { composerHeading: name } : {}),
              ...(groupIndex === 0 && index === 0 ? { section } : {}),
            }),
          );
        });
    }
  } else {
    corpus.midis.forEach((midiSlug, index) =>
      rows.push({
        midiSlug,
        section: sections.find((section) => section.startIndex === index),
      }),
    );
  }

  const renderSectionHeader = (section: (typeof sections)[number]) => (
    <header
      id={section.id}
      style={{
        margin: "32px 0 18px",
        paddingTop: "16px",
        borderTop: `1px solid ${section.color || "#333"}`,
        scrollMarginTop: "20px",
      }}
    >
      <h2
        style={{
          fontSize: "1.2em",
          margin: "0 0 6px",
          color: section.color,
        }}
      >
        {section.title}{" "}
        <sup
          aria-label={`${stageCount(section)} tracks`}
          style={{ color: "#999", fontSize: "0.65em", fontWeight: "normal" }}
        >
          {stageCount(section)}
        </sup>
      </h2>
      {slug === "simple_major" && (
        <div
          style={{ color: "#888", fontSize: "0.75em", marginTop: "8px" }}
          title="Curated picks based on broad recognition: five /f/ pieces and ten Lakh songs per stage."
        >
          <span style={{ color: section.color }} aria-hidden="true">
            ★
          </span>{" "}
          Popular picks · {popularPicks.get(section.id)?.size || 0} /f/ · 10
          /lakh/
        </div>
      )}
    </header>
  );
  const renderRow = (
    { midiSlug, section, composerHeading, sectionId }: DisplayRow,
    index: number,
  ) => {
    const order = getComposerOrder(midiSlug);
    const hasOrder = order !== undefined;
    const composerInfo = getComposerInfo(midiSlug);
    const isPopular = popularPicks.get(sectionId || "")?.has(midiSlug) || false;
    const highlightColor = sections.find((s) => s.id === sectionId)?.color;

    return (
      <React.Fragment key={midiSlug}>
        {section && renderSectionHeader(section)}
        {composerHeading && (
          <h3
            style={{
              color: "#ccc",
              fontSize: "0.95em",
              margin: "0 0 3px",
            }}
          >
            {composerHeading}
          </h3>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: corpus.showComposerTimeline ? "3px" : "10px",
          }}
        >
          {!corpus.showComposerTimeline && (
            <span style={{ marginRight: "0.3em", color: "gray" }}>{`${
              index + 1
            }. `}</span>
          )}
          <PieceLink
            href={`/f/${midiSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            $hasOrder={hasOrder}
            aria-label={
              isPopular ? `${pieceTitle(midiSlug)} — popular pick` : undefined
            }
            title={
              isPopular
                ? "Popular pick · curated for broad recognition"
                : undefined
            }
          >
            {isPopular && (
              <span
                aria-hidden="true"
                style={{
                  color: highlightColor,
                  marginRight: "6px",
                  fontSize: "0.8em",
                }}
              >
                ★
              </span>
            )}
            {corpus.showComposerTimeline ? (
              pieceTitle(midiSlug)
            ) : composerInfo ? (
              <ComposerTitle
                composer={composerInfo.composer}
                displayTitle={composerInfo.displayTitle}
                style={{
                  color: hasOrder ? "gray" : "inherit",
                }}
              />
            ) : (
              beautifySlug(midiSlug)
            )}
            {hasOrder && <span style={{ marginLeft: "5px" }}>({order})</span>}
          </PieceLink>
          {!corpus.showComposerTimeline && getTagsForMidi(midiSlug) && (
            <div
              style={{
                marginLeft: "50px",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {getTagsForMidi(midiSlug).map((tag, index) => {
                const [chapter, topic] = tag.split(":");
                return (
                  <div
                    key={index}
                    style={{
                      color: hasOrder ? "gray" : "inherit",
                      fontSize: "0.7em",
                      marginRight: "10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "left",
                      lineHeight: "1.2",
                    }}
                  >
                    <span style={{ color: "gray" }}>
                      {chapter?.replace(/_/g, " ")}
                    </span>
                    <span style={{ color: "white" }}>
                      {topic?.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  };

  return (
    <div style={{ marginBottom: "100px" }}>
      <h1>{beautifySlug(slug)}</h1>
      {slug === "musescore_instrumental_top" && (
        <p>
          <a href="/musescore-upload-tracker">
            Track uploads across all 100 MuseScore ranking pages
          </a>
        </p>
      )}
      {corpus.posttext}
      {corpus.showComposerTimeline && (
        <ComposerBirthYearTimeline
          entries={corpus.midis.map((midiSlug, index) => ({
            slug: midiSlug,
            title: pieceTitle(midiSlug),
            href: `/f/${midiSlug}`,
            composer: getCorpusComposerInfo(midiSlug),
            categoryId: sections.find(
              (section) =>
                index >= section.startIndex &&
                index < section.startIndex + section.count,
            )?.id,
          }))}
          categories={sections.map((section) => ({
            id: section.id,
            label: section.title,
            color: section.color || "#ddd",
          }))}
          highlightedCategoryId={hoveredCategory ?? focusedCategory}
          itemLabel="track"
          ariaLabel="Corpus composer birth year timeline"
        />
      )}
      {sections.length > 0 && (
        <nav
          aria-label="Corpus sections"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            margin: "20px 0",
          }}
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onMouseEnter={() => setHoveredCategory(section.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onFocus={() => setFocusedCategory(section.id)}
              onBlur={() => setFocusedCategory(null)}
              style={{
                color: "#ddd",
                padding: "6px 10px",
                fontSize: "0.85em",
                textDecoration: "none",
              }}
            >
              {section.color && (
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: section.color,
                    marginRight: "6px",
                  }}
                />
              )}
              {section.title}{" "}
              <sup
                aria-label={`${stageCount(section)} tracks`}
                style={{ color: "#999", fontSize: "0.75em" }}
              >
                {stageCount(section)}
              </sup>
            </a>
          ))}
        </nav>
      )}
      {corpus.showComposerTimeline && sections.length
        ? sections.map((section) => {
            const groups: {
              name: string;
              rows: { row: DisplayRow; index: number }[];
            }[] = [];
            rows.forEach((row, index) => {
              if (row.sectionId !== section.id) return;
              if (row.composerHeading)
                groups.push({ name: row.composerHeading, rows: [] });
              groups.at(-1)?.rows.push({ row, index });
            });
            const fPieces = (
              <ComposerColumns>
                {groups.map((group) => (
                  <div key={group.name}>
                    {group.rows.map(({ row, index }) =>
                      renderRow({ ...row, section: undefined }, index),
                    )}
                  </div>
                ))}
              </ComposerColumns>
            );
            const lakhGroups = new Map<string, ReturnType<typeof lakhPieces>>();
            for (const piece of lakhPieces(section.id)) {
              if (!lakhGroups.has(piece.artist))
                lakhGroups.set(piece.artist, []);
              lakhGroups.get(piece.artist)!.push(piece);
            }
            return (
              <section key={section.id}>
                {renderSectionHeader(section)}
                {slug === "simple_major" ? (
                  <StageColumns>
                    <div data-source="f">
                      <h3 data-source-heading>/f/ · {section.count} pieces</h3>
                      {fPieces}
                    </div>
                    <div data-source="lakh">
                      <h3 data-source-heading>
                        /lakh/ · {lakhPieces(section.id).length} candidates
                      </h3>
                      <ComposerColumns>
                        {[...lakhGroups].map(([artist, pieces]) => (
                          <div key={artist}>
                            <h3
                              style={{
                                color: "#888",
                                fontSize: "0.95em",
                                margin: "0 0 3px",
                              }}
                            >
                              {artist}
                            </h3>
                            <BeatlesDiscography
                              groupByAlbum={false}
                              files={pieces.map((piece) => piece.filename)}
                              allFiles={pieces.map((piece) => piece.filename)}
                              isAnnotated={(file) =>
                                !!analyses[lakhAnalysisKey(artist, file)]
                              }
                              renderTitle={(title) => (
                                <>
                                  {renderLakhPopularStar(
                                    section.id,
                                    artist,
                                    title,
                                  )}
                                  {title}
                                </>
                              )}
                              renderTrack={(file, label) => {
                                const piece = pieces.find(
                                  (piece) => piece.filename === file,
                                )!;
                                const key = lakhAnalysisKey(artist, file);
                                const analysis = analyses[key];
                                const community = Object.keys(
                                  annotationVersions[key] || {},
                                ).some((owner) => owner !== ADMIN_USER_ID);
                                return (
                                  <LakhEntry
                                    to={`/${piece.slug}`}
                                    $folder={false}
                                    $annotated={!!analysis}
                                    $community={community}
                                    $hasFewSections={
                                      !!analysis &&
                                      (analysis.sections?.length ?? 0) <= 1
                                    }
                                    $version={
                                      label !== undefined && /^\d+$/.test(label)
                                    }
                                    title={`${file}${
                                      analysis ? " · Annotated" : ""
                                    }`}
                                    aria-label={`${piece.title}${
                                      analysis ? " · Annotated" : ""
                                    }`}
                                  >
                                    {label !== undefined &&
                                      !/^\d+$/.test(label) &&
                                      renderLakhPopularStar(
                                        section.id,
                                        artist,
                                        label,
                                      )}
                                    {label || piece.title}
                                  </LakhEntry>
                                );
                              }}
                            />
                          </div>
                        ))}
                      </ComposerColumns>
                    </div>
                  </StageColumns>
                ) : (
                  fPieces
                )}
              </section>
            );
          })
        : rows.map(renderRow)}
    </div>
  );
};

export default Corpus;
