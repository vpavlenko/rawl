import React from "react";
import { Link } from "react-router-dom";

interface SnippetLinkProps {
  chapter: string;
  topic: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SnippetLink: React.FC<SnippetLinkProps> = ({
  chapter,
  topic,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <Link
      to={`/s/${encodeURIComponent(chapter.trim())}/${encodeURIComponent(
        topic.trim(),
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "inline-block",
        lineHeight: "0.9",
        position: "relative",
      }}
    >
      <div>
        <span style={{ color: "#777" }}>{chapter.replace(/_/g, " ")}</span>
        <span style={{ color: "#ccc", display: "block" }}>
          {topic.replace(/_/g, " ")}
        </span>
      </div>
    </Link>
  );
};
