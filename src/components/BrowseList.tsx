import * as React from "react";
import { memo } from "react";
import { Link } from "react-router-dom";

function splitOnLastSlash(str) {
  var lastIndex = str.lastIndexOf("/");
  if (lastIndex === -1) {
    return [str, ""];
  }
  var firstPart = str.substring(0, lastIndex);
  var lastPart = str.substring(lastIndex + 1);
  return [firstPart, lastPart];
}

export default memo(BrowseList);
function BrowseList({ items, analyses }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignContent: "flex-start",
        }}
      >
        {items.map((item, index) => {
          const path = item.path
            .replace("%", "%25")
            .replace("#", "%23")
            .replace("&", "%26")
            .replace(/^\//, "");
          const name = item.path.split("/").pop();
          const [artist, song] = splitOnLastSlash(path);
          let fileAnalysis =
            analyses &&
            ((analyses[path] && Object.values(analyses[path])) ||
              (analyses[artist] && analyses[artist][song]));
          if (fileAnalysis && fileAnalysis[0]) {
            fileAnalysis = fileAnalysis[0];
          }

          if (item.type === "directory") {
            return (
              <div
                key={index}
                className={
                  "BrowseList-row" +
                  (items.length > 4 ? " BrowseList-row-mainPage" : "")
                }
              >
                <div className="BrowseList-colName">
                  <Link
                    to={"/browse/" + path}
                    className={!fileAnalysis ? "DirectoryLink-dim" : ""}
                  >
                    {name}
                  </Link>
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={index}
                className={"BrowseList-row BrowseList-row-mainPage"}
              >
                <div className="BrowseList-colName">
                  {
                    <a
                      onClick={(e) => {
                        if (item.slug) {
                          window.location.href = `/f/${item.slug}`;
                        } else {
                          const [, path] =
                            window.location.href.split("/browse/");

                          window.location.href = `/c/${path}/${name}`;
                        }
                      }}
                      style={{ color: fileAnalysis ? "#ff0" : "#aaa" }}
                    >
                      {name}
                    </a>
                  }
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
