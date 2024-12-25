import { faQuoteRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cite from "citation-js";
import * as React from "react";
import styled from "styled-components";
import { CITES } from "./cites";

const CitationContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 12px;
`;

const CitationIcon = styled.span<{ hasUrl?: boolean }>`
  position: relative;
  left: -12px;
  top: -8px;
  cursor: pointer;
  color: #666;
  margin-left: 8px;

  &:hover {
    color: #999;
  }
`;

const CitationPopup = styled.div<{ position: "right" | "below-left" }>`
  position: absolute;
  ${(props) =>
    props.position === "right"
      ? `
    left: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%);
  `
      : `
    right: -12px;
    top: calc(100% + 12px);
    transform: none;
  `}
  background: rgba(0, 0, 0, 0.95);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #444;
  width: 300px;
  color: #ddd;
  font-size: 14px;
  z-index: 1000;

  &:before {
    content: "";
    position: absolute;
    ${(props) =>
      props.position === "right"
        ? `
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-right: 6px solid #444;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: none;
    `
        : `
      top: -6px;
      right: 12px;
      transform: none;
      border-bottom: 6px solid #444;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: none;
    `}
    width: 0;
    height: 0;
  }
`;

interface CitationProps {
  citeKey: keyof typeof CITES;
}

export const Citation: React.FC<CitationProps> = ({ citeKey }) => {
  const [showCitation, setShowCitation] = React.useState(false);
  const [formattedCitation, setFormattedCitation] = React.useState<string>("");
  const [citationUrl, setCitationUrl] = React.useState<string | undefined>();
  const [position, setPosition] = React.useState<"right" | "below-left">(
    "right",
  );
  const iconRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const cite = new Cite(CITES[citeKey].bibtex);
    const data = cite.format("data", { format: "object" })[0];

    // Store URL if it exists
    setCitationUrl(data.URL || undefined);

    // Format authors/editors
    let authors = "";
    if (data.author) {
      authors = data.author
        .map((author) => `${author.given} ${author.family}`)
        .join(" and ");
    } else if (data.editor) {
      authors = data.editor
        .map((editor) => `${editor.given} ${editor.family}`)
        .join(" and ");
    }

    const year = data.issued?.["date-parts"]?.[0]?.[0] || "";
    const title = data.title || "";

    // Format where field with optional chaining
    const whereText = CITES[citeKey]?.where
      ? ` <span class="grey-text">${CITES[citeKey].where}</span>`
      : "";

    // Combine with italics for authors and year
    const formattedText = `<i>${authors}</i> (<i>${year}</i>). ${title}.${whereText}`;
    setFormattedCitation(formattedText);
  }, [citeKey]);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const rightSpace = window.innerWidth - rect.right;
      // If there's not enough space on the right (300px for tooltip + 32px padding), show below-left
      setPosition(rightSpace < 332 ? "below-left" : "right");
    }
    setShowCitation(true);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    if (citationUrl) {
      e.stopPropagation();
      window.open(citationUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <CitationContainer>
      <CitationIcon
        ref={iconRef}
        hasUrl={!!citationUrl}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowCitation(false)}
        onClick={handleIconClick}
      >
        <FontAwesomeIcon icon={faQuoteRight} size="sm" />
      </CitationIcon>

      {showCitation && (
        <CitationPopup position={position}>
          <style>{`.grey-text { color: #888; }`}</style>
          <span dangerouslySetInnerHTML={{ __html: formattedCitation }} />
        </CitationPopup>
      )}
    </CitationContainer>
  );
};
