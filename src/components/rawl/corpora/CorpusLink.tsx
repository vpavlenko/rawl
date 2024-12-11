import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Link } from "react-router-dom";
import { beautifySlug } from "./utils";

const badgeStyle = {
  container: {
    fontSize: "0.9em",
    letterSpacing: "0.05em",
    color: "#ddd",
    textDecoration: "none",
    cursor: "pointer",
  } as const,
  icon: faList,
  iconColor: "#ddd",
};

export const CorpusLink: React.FC<{ slug: string }> = ({ slug }) => {
  return (
    <Link
      to={`/corpus/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...badgeStyle.container,
        whiteSpace: "nowrap",
        cursor: "pointer",
      }}
    >
      <FontAwesomeIcon
        icon={badgeStyle.icon}
        style={{
          width: "12px",
          marginRight: "6px",
          color: badgeStyle.iconColor,
        }}
      />
      {beautifySlug(slug)}
    </Link>
  );
};
