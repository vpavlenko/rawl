import * as React from "react";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import ChordStairs from "./ChordStairs";
import { PianoLegend } from "./PianoLegend";
import SnippetList from "./SnippetList";
import { Snippet } from "./analysis";
import { TOP_100_COMPOSERS } from "./top100Composers";

type EnhancedSnippet = Snippet & {
  composerSlug: string;
};

const BookContainer = styled.div`
  width: 95%;
  padding: 20px;
  color: #ddd;
  margin: 0 auto;
`;

export const ComposerTitle: React.FC<{
  composer: string;
  displayTitle: string;
  style?: React.CSSProperties;
}> = ({ composer, displayTitle, style }) => (
  <span style={style}>
    <span style={{ color: "#999" }}>{composer}. </span>
    <span style={{ color: "white" }}>{displayTitle}</span>
  </span>
);

const IntroText = () => {
  return (
    <div style={{ maxWidth: "40em", marginTop: "180px" }}>
      <h2>How did I pick the pieces?</h2>
      <p>
        I went through{" "}
        <a
          href="https://musescore.com/sheetmusic/non-official?sort=view_count"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://musescore.com/sheetmusic/non-official?sort=view_count
        </a>
        . My goal was to find {TOP_100_COMPOSERS.length} most popular composers
        and take the most popular score from each of them.
      </p>

      <p>
        I've gathered the corpus on Oct 31, 2024. The view count on the most
        popular work doesn't equal the work's popularity even on MuseScore. Eg.
        "River flows in you" has 7.3M on the most popular arrangement, but their
        next top 5 arrangements (out of 687 community scores of this title) have
        1.5M more view counts. I don't add up all view counts across all
        versions, I purely use the top 1 - which makes a bit of a random
        selection at the lower end of the top 100.
      </p>

      <p>
        Some compositions which almost made it to top 100 by a very narrow
        margin are BTS's "I Need You", as well as themes from "Godfather" and
        "The Pink Panther". Next time!
      </p>

      <p>
        I don't use the number of view counts (position within the top 100)
        throughout the book on harmony. I care about the total range of harmonic
        devices used, not about their relative popularity weighted by each
        work's popularity.
      </p>

      <p>
        Neither do I want it to be weighted by the number of distinct pieces of
        the same composer which are popular. So, as a result of my method I
        include "Für Elise" and therefore I exclude "Moonlight" and "Tempest".
        Out of the entire Bach heritage I include exactly a single WTC-1 C major
        prelude. As a benefit, I don't get 7 works of Chopin into the top 100 as
        I would otherwise. Also we cut on Liszt, Joe Hisaishi, Koji Kondo, Ed
        Sheeran etc.
      </p>

      <p>
        In most cases, I take the same arrangement that scored the most views.
        Sometimes I find an arrangement that suits better to my narrative -
        maybe by having less mistakes, original key, better MIDI sound or so.
      </p>

      <p>
        I only take solo piano arrangements because I want to focus on harmony,
        not on the arrangement. For "We Are Number One" the most popular version
        is a band arrangement, and I represent this piece by its piano
        arrangement.
      </p>

      <p>
        In the special case of "He's a Pirate", I attribute it to Klaus Badelt
        to avoid excluding it because of Hans Zimmer's "Interstellar". Call it
        data manipulation, but they are even written in different minors (major
        V vs natural).
      </p>

      <p>
        In the case of "G Minor Bach" the original harmony was modernized so
        much that I include this track under Luo Ni.
      </p>

      <p>
        Also, I ignore Turkish tabs from Musa Çetiner's account. This is a great
        material which I'd look into separately. I'm not sure these view counts
        are coming from anywhere outside of the Turkish-speaking world.
      </p>

      <p>
        For ABBA, I take "The Winner Takes It All" instead of "Chiquitita",
        because "Chiquitita", although higher in view counts, is represented
        only by its ending.
      </p>

      <p>
        As I understand, the copyright takedowns of community scores didn't
        affect my corpus - even John Williams got represented.
      </p>
    </div>
  );
};

const Book = () => {
  const appContext = React.useContext(AppContext);
  if (!appContext) throw new Error("AppContext not found");
  const { analyses } = appContext;
  const [loadingSnippets, setLoadingSnippets] = React.useState<Set<string>>(
    new Set(),
  );
  const [hoveredSlug, setHoveredSlug] = React.useState<string | null>(null);

  // Sort composers with order first, then the rest
  const orderedComposers = [...TOP_100_COMPOSERS].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return 0;
  });

  // Group composers by chapters
  const composerGroups = orderedComposers.reduce<
    Array<typeof TOP_100_COMPOSERS>
  >((acc, composer) => {
    if (composer.chapter || acc.length === 0) {
      acc.push([composer]);
    } else {
      acc[acc.length - 1].push(composer);
    }
    return acc;
  }, []);

  // Handle snippet click with loading state
  const handleSnippetClick = async (snippet: EnhancedSnippet) => {
    const slug = snippet.composerSlug;
    setLoadingSnippets((prev) => new Set([...prev, slug]));
    try {
      await appContext.handleSongClick(slug);
      // If the snippet has secondsSpan, seek to (secondsSpan - 1) seconds
      if (snippet.secondsSpan) {
        const seekPosition = Math.max(0, (snippet.secondsSpan[0] - 1) * 1000); // Convert to milliseconds
        appContext.seek(seekPosition);
      }
    } finally {
      setLoadingSnippets((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  };

  return (
    <BookContainer>
      <div style={{ position: "relative" }}>
        <h1>Visual Harmony of Top 100 Composers on MuseScore.com</h1>
        <div
          style={{
            marginTop: "70px",
            marginBottom: "70px",
            marginLeft: "150px",
            transform: "scale(0.9)",
          }}
        >
          <PianoLegend inline={false} />
        </div>

        {composerGroups.map((group, groupIndex) => {
          const groupSnippets = group.flatMap((item) =>
            (analyses[`f/${item.slug}`]?.snippets || [])
              .filter((snippet) => snippet.tag === "book:index")
              .map((snippet) => ({ ...snippet, composerSlug: item.slug })),
          );

          return (
            <div key={`group-${groupIndex}`}>
              <div
                style={{
                  marginBottom: "10px",
                  marginTop: "50px",
                  marginLeft: "150px",
                  transform: "scale(0.9)",
                }}
              >
                {group[0].mode && <ChordStairs mode={group[0].mode} />}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "start",
                  gap: "60px",
                  marginBottom: "80px",
                }}
              >
                <div>
                  {group[0].chapter && (
                    <>
                      <h2 style={{ margin: "0 0 10px 0" }}>
                        {group[0].chapter}
                      </h2>
                    </>
                  )}
                  <ul
                    style={{
                      listStyle: "none",
                      paddingLeft: "0",
                      margin: "0",
                    }}
                  >
                    {group.map(({ slug, composer, displayTitle }) => (
                      <li
                        key={slug}
                        style={{
                          marginLeft: "0",
                          whiteSpace: "nowrap",
                          transition: "all 0.3s ease",
                          textShadow:
                            hoveredSlug === slug
                              ? "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)"
                              : "none",
                          padding: "4px 0px",
                          borderRadius: "4px",
                          backgroundColor:
                            hoveredSlug === slug
                              ? "rgba(255, 255, 255, 0.1)"
                              : "transparent",
                        }}
                      >
                        <a
                          href={`/f/${slug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: hoveredSlug === slug ? "#fff" : "white",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <ComposerTitle
                            composer={composer}
                            displayTitle={displayTitle}
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                {groupSnippets.length > 0 && (
                  <div>
                    <SnippetList
                      snippets={groupSnippets}
                      noteHeight={3}
                      isPreview={true}
                      onSnippetClick={handleSnippetClick}
                      loadingSnippets={loadingSnippets}
                      onSnippetHover={(snippet) =>
                        setHoveredSlug(
                          snippet
                            ? (snippet as EnhancedSnippet).composerSlug
                            : null,
                        )
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <IntroText />
      </div>
    </BookContainer>
  );
};

export default Book;
