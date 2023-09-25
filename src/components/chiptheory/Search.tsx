import * as React from "react";
import { memo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Analysis } from "./Analysis";

const Search: React.FC<{
  analyses: {
    [game: string]: { [file: string]: { [subtune: number]: Analysis } };
  };
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
        <div>
          <h6 style={{ marginBottom: "0px" }}>{categoryName}</h6>
          <div style={{ margin: "0px 0px 30px 10px" }}>
            {Object.entries(categoryContent).map(([value, items]) => {
              return (
                <div
                  style={{
                    cursor: "pointer",
                    marginBottom: "3px",
                    ...(categoryName === selectedCategory &&
                    value === selectedValue
                      ? { color: "yellow" }
                      : {}),
                  }}
                  onClick={() =>
                    history.push(`/search/${categoryName}/${value}`)
                  }
                >
                  {value.split(/[_-]/).join(" ")}{" "}
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
