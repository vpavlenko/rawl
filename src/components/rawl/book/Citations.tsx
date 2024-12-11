import { faQuoteRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cite from "citation-js";
import * as React from "react";
import styled from "styled-components";
import { CITES } from "./cites";

const CitationContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const CitationIcon = styled.span`
  cursor: pointer;
  color: #666;
  margin-left: 8px;

  &:hover {
    color: #999;
  }
`;

const CitationPopup = styled.div`
  position: absolute;
  left: calc(100% + 20px);
  top: 50%;
  transform: translateY(-50%);
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
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid #444;
  }
`;

const GreyText = styled.span`
  color: #888;
`;

interface CitationProps {
  citeKey: keyof typeof CITES;
}

export const Citation: React.FC<CitationProps> = ({ citeKey }) => {
  const [showCitation, setShowCitation] = React.useState(false);
  const [formattedCitation, setFormattedCitation] = React.useState<string>("");

  React.useEffect(() => {
    const cite = new Cite(CITES[citeKey].bibtex);
    const data = cite.format("data", { format: "object" })[0];

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

    // Format pages
    const pages = CITES[citeKey].pages?.[0];
    const pageText = pages
      ? ` <span class="grey-text">${
          pages.includes("-") ? "pp." : "p."
        } ${pages}</span>`
      : "";

    // Combine with italics for authors and year
    const formattedText = `<i>${authors}</i> (<i>${year}</i>). ${title}.${pageText}`;
    setFormattedCitation(formattedText);
  }, [citeKey]);

  return (
    <CitationContainer>
      <CitationIcon
        onMouseEnter={() => setShowCitation(true)}
        onMouseLeave={() => setShowCitation(false)}
      >
        <FontAwesomeIcon icon={faQuoteRight} size="sm" />
      </CitationIcon>

      {showCitation && (
        <CitationPopup>
          <style>{`.grey-text { color: #888; }`}</style>
          <span dangerouslySetInnerHTML={{ __html: formattedCitation }} />
        </CitationPopup>
      )}
    </CitationContainer>
  );
};
