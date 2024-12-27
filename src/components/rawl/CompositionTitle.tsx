import {
  faArrowUpRightFromSquare,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import styled from "styled-components";
import {
  GenreList,
  getEmojis,
  getUniqueStyles,
  hasMetadata,
} from "../../utils/corpusUtils";
import { ComposerTitle } from "./book/Book";
import { corpora, MUSESCORE_TOP_100_SLUG } from "./corpora/corpora";
import { CorpusLink } from "./corpora/CorpusLink";
import { TOP_100_COMPOSERS } from "./top100Composers";

const MUSESCORE_ICON = `
<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 32">
  <path d="M5.529 8.944h.087c.088-3.375 2.677-6.18 5.968-6.18 2.15 0 3.685.92 4.475 2.19-1.14.482-2.018 1.622-2.018 3.025 0 1.885 1.58 3.331 3.51 3.331 1.93 0 3.51-1.622 3.51-3.769 0-3.638-3.334-6.97-7.766-6.97-4.43 0-7.81 3.55-7.81 7.715 0 .175 0 .35.044.657m13.69 13.369 3.64-5.61L6.363 9.644l-.044.043 12.9 12.624Zm4.65-3.726c0 4.821-4.125 8.152-8.336 8.152-3.291 0-5.705-1.183-6.889-2.805 1.492-.877 2.37-2.367 2.37-4.251 0-2.806-2.282-5.085-5.31-5.085C2.502 14.597 0 17.183 0 20.558c0 5.48 5.177 10.87 12.329 10.87C19.48 31.429 24 25.819 24 19.464c0-.351 0-.57-.044-.877h-.087Z" fill="white"/>
</svg>
`;

export type CompositionTitleProps = {
  slug: string;
  sourceUrl: string | null;
  onSourceUrlUpdate: (newUrl: string) => void;
};

const MetadataContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
`;

export const RelatedCorpora = styled.div<{ horizontal?: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.horizontal ? "row" : "column")};
  gap: ${(props) => (props.horizontal ? "30px" : "8px")};
`;

export const CorpusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RelatedCorporaDisplay: React.FC<{
  slug: string;
  horizontal?: boolean;
  showMetadata?: boolean;
}> = ({ slug, horizontal = false, showMetadata = true }) => {
  const relatedCorporaSlugs = React.useMemo(() => {
    return corpora
      .filter((corpus) => corpus.midis.includes(slug))
      .filter((corpus) => corpus.slug !== MUSESCORE_TOP_100_SLUG)
      .map((corpus) => corpus.slug);
  }, [slug]);

  if (relatedCorporaSlugs.length === 0) return null;

  return (
    <RelatedCorpora horizontal={horizontal}>
      {relatedCorporaSlugs.map((corpusSlug) => {
        const corpus = corpora.find((c) => c.slug === corpusSlug);
        if (!corpus) return null;

        return (
          <CorpusRow key={corpusSlug}>
            <CorpusLink slug={corpusSlug} />
            {showMetadata && hasMetadata(corpus) && (
              <MetadataContainer>
                {corpus.country && <div>{getEmojis(corpus.country)}</div>}
                {(corpus.genre || corpus.style) && (
                  <GenreList>
                    {getUniqueStyles(corpus.genre, corpus.style).join(", ")}
                  </GenreList>
                )}
                {corpus.composerBirthYear && (
                  <span style={{ color: "#999" }}>
                    *{corpus.composerBirthYear}
                  </span>
                )}
              </MetadataContainer>
            )}
          </CorpusRow>
        );
      })}
    </RelatedCorpora>
  );
};

const CompositionTitle: React.FC<CompositionTitleProps> = ({
  slug,
  sourceUrl,
  onSourceUrlUpdate,
}) => {
  const [editedUrl, setEditedUrl] = React.useState(sourceUrl || "");

  const handleSave = () => {
    if (editedUrl !== sourceUrl) {
      onSourceUrlUpdate(editedUrl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  const formattedTitle = slug
    .replace(/---/g, " – ")
    .replace(/-/g, " ")
    .replace(/_/g, " ");

  const composerInfo = React.useMemo(() => {
    return TOP_100_COMPOSERS.find((composer) => composer.slug === slug);
  }, [slug]);

  const searchQuery = encodeURIComponent(formattedTitle);
  const museScoreUrl = `https://musescore.com/sheetmusic?sort=view_count&text=${searchQuery}`;

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        fontSize: "16px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "1em",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "flex-start",
        }}
      >
        <div>
          {composerInfo ? (
            <ComposerTitle
              composer={composerInfo.composer}
              displayTitle={composerInfo.displayTitle}
            />
          ) : (
            formattedTitle
          )}
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "gray",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {sourceUrl.includes("musescore.com") ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    marginLeft: "20px",
                  }}
                  dangerouslySetInnerHTML={{ __html: MUSESCORE_ICON }}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  style={{ width: "15px", marginLeft: "10px" }}
                />
              )}
            </a>
          ) : (
            <>
              <input
                type="text"
                value={editedUrl}
                onChange={(e) => setEditedUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                style={{
                  marginLeft: "10px",
                  fontSize: "0.8em",
                  width: "200px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "white",
                  padding: "2px 5px",
                }}
                placeholder="Enter source URL"
              />
              <a
                href={museScoreUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "gray",
                  textDecoration: "none",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
                title="Search on MuseScore"
              >
                <FontAwesomeIcon icon={faLink} />
              </a>
            </>
          )}
        </div>

        <RelatedCorporaDisplay slug={slug} />
      </h1>
    </div>
  );
};

export default CompositionTitle;
