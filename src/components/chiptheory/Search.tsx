import * as React from "react";
import { memo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Analysis } from "./Analysis";
import { RomanNumerals } from "./romanNumerals";

type Corpus = {
  [game: string]: { [file: string]: { [subtune: number]: Analysis } };
};

export const matches = (analysis: Analysis, searchPath: string) => {
  const searchCategory = searchPath.slice(0, searchPath.indexOf("/"));
  const searchValue = searchPath.slice(searchPath.indexOf("/") + 1);
  if (searchCategory === "chords") {
    // TODO: fails on half-measures, seventh chords, power chords, inversions.
    // Also the spaces are hilarious
    return (
      " " +
      (analysis.romanNumerals || "").replace(/-/g, " ") +
      " "
    ).includes(" " + searchValue.replace(/-/g, " ") + " ");
  }

  return (analysis.tags || []).some(
    (tag) => tag === searchPath.replace("/", ":"),
  );
};

const ROMAN_NUMERALS_SEARCH = [
  "VI VII I",
  "V/ii",
  "V/V",
  "V IV I",
  "I VII",
  "V7/IV",
  "IV iv",
  "viio/V",
  "viio7",
  "bII",
  "i VII VI V",
];

export const filterListing = (
  listing,
  analyses: Corpus,
  searchPath: string,
) => {
  if (!searchPath || !analyses) return listing;

  return listing.filter(
    ({ path }) =>
      path === ".." ||
      (analyses[path.slice(1)] &&
        Object.values(analyses[path.slice(1)]).some((file) =>
          Object.values(file).some((analysis) => matches(analysis, searchPath)),
        )),
  );
};

const Search: React.FC<{
  analyses: Corpus;
  searchPath: string;
}> = ({ analyses, searchPath }) => {
  searchPath = searchPath || "";

  const history = useHistory();

  const [tags, setTags] = useState({});

  const selectedCategory = searchPath.slice(0, searchPath.indexOf("/"));
  const selectedValue = searchPath.slice(searchPath.indexOf("/") + 1);

  useEffect(() => {
    const result = {};
    if (analyses) {
      Object.keys(analyses).map((game) =>
        Object.keys(analyses[game]).map((file) => {
          Object.entries(analyses[game][file]).map(([subtune, analysis]) => {
            (analysis.tags || []).map((tag) => {
              const [category, value] = tag.split(":");
              if (!result[category]) {
                result[category] = {};
              }

              result[category][value] = [
                ...(result[category][value] || []),
                { game, file, subtune, analysis },
              ];
            });
          });
        }),
      );
    }
    setTags(result);
  }, [analyses]);

  return (
    <div>
      <div key="rn" style={{ margin: "0px 0px 30px 0px" }}>
        <h6 style={{ marginBottom: "5px" }}>roman numerals</h6>
        {ROMAN_NUMERALS_SEARCH.map((rn) => (
          <div
            key={rn}
            style={{
              cursor: "pointer",
              margin: "0px 10px 10px 1px",
              display: "inline-block",
              ...(selectedCategory === "chords" &&
              selectedValue.replace(/-/g, " ") === rn
                ? {
                    boxShadow: "0px 0px 0px 1px white",
                  }
                : {}),
            }}
            onClick={() =>
              history.push(`/search/chords/${rn.replace(/ /g, "-")}`)
            }
          >
            <RomanNumerals romanNumerals={rn} />
          </div>
        ))}
      </div>
      {Object.entries(tags).map(([categoryName, categoryContent]) => (
        <div key={categoryName}>
          <h6 style={{ marginBottom: "2px" }}>
            {categoryName.replace(/_/g, " ")}
          </h6>
          <div style={{ margin: "0px 0px 30px 0px" }}>
            {Object.entries(categoryContent).map(([value, items]) => {
              return (
                <div
                  key={value}
                  style={{
                    cursor: "pointer",
                    // marginBottom: "0px",
                    ...(categoryName === selectedCategory &&
                    value === selectedValue
                      ? { color: "yellow" }
                      : {}),
                  }}
                  onClick={() =>
                    history.push(`/search/${categoryName}/${value}`)
                  }
                >
                  {value.replace(/_/g, " ")}{" "}
                  <span style={{ fontSize: "16px" }}>{items.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(Search);
