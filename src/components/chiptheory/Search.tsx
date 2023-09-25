import * as React from "react";
import { memo, useEffect, useState } from "react";
import { Analysis } from "./Analysis";
import Card from "./Card";

const Search: React.FC<{
  analyses: {
    [game: string]: { [file: string]: { [subtune: number]: Analysis } };
  };
}> = ({ analyses }) => {
  const [tags, setTags] = useState({});
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
    console.log(result);
  }, [analyses]);

  return (
    <div>
      <h3 className="Browse-topRow">Chiptheory Search by Tags</h3>
      {Object.entries(tags).map(([categoryName, categoryContent]) => (
        <div>
          <h3>{categoryName}</h3>
          {Object.entries(categoryContent).map(([value, items]) => {
            return (
              <div>
                <h3>
                  {value} : {items.length}
                </h3>
                {items.map(({ analysis, subtune }) => (
                  <Card analysis={analysis} index={subtune} />
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default memo(Search);
