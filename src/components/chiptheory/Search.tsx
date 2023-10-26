import * as React from "react";
import { memo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Analysis } from "./Analysis";
import { Scale } from "./Book";
import { RowOfRomanNumerals } from "./romanNumerals";

type Corpus = {
  [game: string]: { [file: string]: { [subtune: number]: Analysis } };
};

export const matches = (analysis: Analysis, searchPath: string): boolean => {
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
  if (searchCategory === "cover") {
    // a dirty hack: the section is called "covers", but that's how split by slash works when searchValue is empty
    return Boolean(analysis.basedOn);
  }

  return (analysis.tags || []).some(
    (tag) => tag === searchPath.replace("/", ":"),
  );
};

const ROMAN_NUMERALS_SEARCH = [
  "VI VII I",
  "I III",
  "III IV V",
  // "VI i4",
  "i VI i",
  "i I",
  "IV iv",
  "I VII",
  "VII VI V",
  "VII VI v",
  "V IV I",
  "V vi",
  "V/ii",
  "V7/IV",
  "V/V",
  "V/vi",
  // "i #IV", // TODO: make searchable. sharp can't be used in the URL unencoded
  "viio/V",
  "viio7",
  "V+",
  "bII",
  // "#VII", // TODO: make searchable, see above
  "bvii",
  "io7",
  "I7",
  "I^",
  "viø",
];
const SCALE_DEGREES = {
  dorian: [0, 2, 3, 5, 7, 9, 10],
  pentatonic: [0, 3, 5, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6],
  blues: [0, 3, 5, 6, 7, 10],
  "whole-tone": [0, 2, 4, 6, 8, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  nikriz: [0, 2, 3, 6, 7],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
  mixed_minor: [8, 9, 10, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  hexatonic_minor_no6: [0, 2, 3, 5, 7, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  major_pentatonic: [0, 2, 4, 7, 9],
  harmonic_major: [0, 2, 4, 5, 7, 8, 11],
};

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
  const [basedOnCount, setBasedOnCount] = useState(0);

  const selectedCategory = searchPath.slice(0, searchPath.indexOf("/"));
  const selectedValue = searchPath.slice(searchPath.indexOf("/") + 1);

  useEffect(() => {
    const result = {
      scale: {
        phrygian: [],
        natural_minor: [],
        dorian: [],
        melodic_minor: [],
        nikriz: [],
        mixed_minor: [],
        hexatonic_minor_no6: [],
        pentatonic: [],
        blues: [],
        mixolydian: [],
        major: [],
        lydian: [],
        harmonic_major: [],
        major_pentatonic: [],
      },
      bass: {},
      middle_voice: {},
    };
    let basedOnCountInner = 0;
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
            if (analysis.basedOn) {
              basedOnCountInner++;
            }
          });
        }),
      );
    }
    setTags(result);
    setBasedOnCount(basedOnCountInner);
  }, [analyses]);

  return (
    <div key="rn">
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
            <RowOfRomanNumerals rnArray={rn.split(" ")} isSearch={true} />
          </div>
        ))}
      </div>
      <div key="covers">
        <div style={{ margin: "0px 0px 30px 0px" }}>
          <h6
            style={{
              marginBottom: "5px",
              cursor: "pointer",
              ...("cover" === selectedCategory ? { color: "yellow" } : {}),
            }}
            onClick={() => history.push(`/search/covers/`)}
          >
            covers <span style={{ fontSize: "16px" }}>{basedOnCount}</span>
          </h6>
        </div>
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
                    ...(categoryName === selectedCategory &&
                    value === selectedValue
                      ? { color: "yellow" }
                      : {}),
                  }}
                  onClick={() =>
                    history.push(`/search/${categoryName}/${value}`)
                  }
                >
                  {categoryName === "scale" && value in SCALE_DEGREES && (
                    <Scale d={SCALE_DEGREES[value]} />
                  )}{" "}
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
