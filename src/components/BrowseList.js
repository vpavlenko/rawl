import trimEnd from "lodash/trimEnd";
import queryString from "querystring";
import * as React from "react";
import { memo, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { CATALOG_PREFIX } from "../config";
import DirectoryLink from "./DirectoryLink";
import { parseBookPath } from "./chiptheory/Book";
import Card from "./chiptheory/Card";
import { matches } from "./chiptheory/Search";

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
function BrowseList({ items, ...props }) {
  const {
    currContext,
    currIdx,
    handleSongClick,
    browsePath,
    playContext,
    analyses,
    searchPath,
    bookPath,
    isSearch,
  } = props;

  const location = useLocation();

  // Chiptheory's autoplay for NES, because most directories have a single file.
  // We select the very first file and serve it.
  useEffect(() => {
    const firstSongItem = items.find((item) => item.type !== "directory");

    const params = new URLSearchParams(location.search);

    if (firstSongItem && firstSongItem?.path?.startsWith("/Nintendo/")) {
      const path =
        firstSongItem.path === ".."
          ? browsePath.substr(0, browsePath.lastIndexOf("/"))
          : firstSongItem.path
              .replace("%", "%25")
              .replace("#", "%23")
              .replace(/^\//, "");

      let subtune =
        params.get("subtune") ||
        (bookPath ? parseBookPath(bookPath).subtune : 1);
      subtune = parseInt(subtune, 10) - 1;

      const href = CATALOG_PREFIX + path;

      handleSongClick(
        href,
        playContext,
        firstSongItem.idx,
        subtune,
      )({
        preventDefault: () => {},
      });
    }

    // Autoplay for MIDI song URLs
    const song = params.get("song");
    if (song) {
      const item = items.find((item) => item.path.endsWith(song));
      if (item) {
        const href = CATALOG_PREFIX + item.path;

        handleSongClick(
          href,
          playContext,
          item.idx,
        )({
          preventDefault: () => {},
        });
      }
    }
  }, [items.length, location]);

  // Scroll Into View
  // ----------------
  // Note this does not work for virtual list, since the playing item might not be in the DOM.
  // See also https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
  const urlParams = queryString.parse(window.location.search.substring(1));
  delete urlParams.q;
  const search = queryString.stringify(urlParams);

  // Check if previous page url is the parent directory of current page url.
  const history = useHistory();
  const prevPath = trimEnd(history.location.state?.prevPathname, "/");
  const currPath = trimEnd(window.location.pathname, "/");
  const prevPageIsParentDir =
    prevPath === currPath.substring(0, currPath.lastIndexOf("/"));

  return (
    <div>
      <div
        style={
          !searchPath
            ? {
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                alignContent: "flex-start",
              }
            : {}
        }
      >
        {items.map((item) => {
          // XXX: Escape immediately: the escaped URL is considered canonical.
          //      The URL must be decoded for display from here on out.
          const path =
            item.path === ".."
              ? browsePath.substr(0, browsePath.lastIndexOf("/")) // parent path
              : item.path
                  .replace("%", "%25")
                  .replace("#", "%23")
                  .replace("&", "%26")
                  .replace(/^\//, "");
          const name = item.path.split("/").pop();
          const isPlaying = currContext === playContext && currIdx === item.idx;
          const isBackLink = item.path === ".." && prevPageIsParentDir;
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
                key={name}
                className={
                  "BrowseList-row" +
                  (items.length > 4 ? " BrowseList-row-mainPage" : "")
                }
              >
                <div className="BrowseList-colName">
                  <DirectoryLink
                    dim={!fileAnalysis}
                    to={"/browse/" + path}
                    search={search}
                    isBackLink={isBackLink}
                    history={history}
                  >
                    {name}
                  </DirectoryLink>
                </div>
                {fileAnalysis && (
                  <div>
                    {Object.entries(fileAnalysis).map(([index, piece]) => {
                      const realIndex = parseInt(index, 10) + 1;
                      return !searchPath || matches(piece, searchPath) ? (
                        <DirectoryLink
                          key={realIndex}
                          dim={new Boolean(fileAnalysis)}
                          to={"/browse/" + path}
                          search={`?subtune=${realIndex}`}
                        >
                          {isSearch && (
                            <div style={{ marginBottom: "40px" }}>
                              <Card analysis={piece} index={realIndex} />
                            </div>
                          )}
                        </DirectoryLink>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          } else {
            const href = CATALOG_PREFIX + path;
            return (
              <div
                key={name}
                className={
                  (isPlaying
                    ? "Song-now-playing BrowseList-row"
                    : "BrowseList-row") + " BrowseList-row-mainPage"
                }
              >
                <div className="BrowseList-colName">
                  {path.startsWith("Nintendo") ? (
                    <a
                      onClick={(e) =>
                        handleSongClick(href, playContext, item.idx)(e)
                      }
                    >
                      {name}
                    </a>
                  ) : (
                    <a
                      onClick={(e) => {
                        const searchParams = new URLSearchParams(
                          window.location.search,
                        );
                        searchParams.set("song", name);

                        history.push({
                          search: searchParams.toString(),
                        });
                        handleSongClick(href, playContext, item.idx)(e);
                      }}
                      style={{ color: fileAnalysis ? "#ff0" : "#aaa" }}
                    >
                      {name}
                    </a>
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
