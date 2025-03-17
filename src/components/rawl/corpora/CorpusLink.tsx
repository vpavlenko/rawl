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

const LOWERCASE_WORDS = ["de", "and"];

const capitalizeWords = (text: string): string => {
  return text
    .split(" ")
    .map((word, index) => {
      if (LOWERCASE_WORDS.includes(word.toLowerCase()) && index !== 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
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
        color: "white",
        fontWeight: "bold",
        letterSpacing: "0.07em",
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
      {capitalizeWords(beautifySlug(slug))}
    </Link>
  );
};
