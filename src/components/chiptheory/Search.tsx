import * as React from "react";
import { memo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Analysis } from "./Analysis";

type Corpus = {
  [game: string]: { [file: string]: { [subtune: number]: Analysis } };
};

export const matches = (analysis: Analysis, searchPath: string) => {
  return (analysis.tags || []).some(
    (tag) => tag === searchPath.replace("/", ":"),
  );
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
  const history = useHistory();

  const [tags, setTags] = useState({});

  const [selectedCategory, selectedValue] = (searchPath || "").split("/");

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
      {Object.entries(tags).map(([categoryName, categoryContent]) => (
        <div key={categoryName}>
          <h6 style={{ marginBottom: "0px" }}>
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
