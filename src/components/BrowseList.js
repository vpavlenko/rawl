import trimEnd from "lodash/trimEnd";
import queryString from "querystring";
import * as React from "react";
import { memo, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { CATALOG_PREFIX } from "../config";
import DirectoryLink from "./DirectoryLink";
import { RomanNumerals } from "./chiptheory/romanNumerals";

const Badge = styled.span`
  border-radius: 0px;
  background-color: ${(props) => props.color || "#ccc"};
  color: black;
  font-family: Helvetica, sans-serif;
  font-size: 12pt;
  padding: 0px 5px;
  white-space: nowrap;
`;

const formatModulation = (newTonic, base) => {
  const diff = (newTonic - base + 12) % 12;
  return diff > 6 ? `-${12 - diff}st` : `+${diff}st`;
};

export default memo(BrowseList);
function BrowseList({ virtual, ...props }) {
  const {
    currContext,
    currIdx,
    favorites,
    toggleFavorite,
    sequencer,
    handleSongClick,
    browsePath,
    playContext,
    analyses,
  } = props;

  const location = useLocation();

  // Chiptheory's autoplay for NES, because most directories have a single file
  useEffect(() => {
    const firstSongItem = virtual.items.find(
      (item) => item.type !== "directory",
    );

    if (firstSongItem) {
      const path =
        firstSongItem.path === ".."
          ? browsePath.substr(0, browsePath.lastIndexOf("/"))
          : firstSongItem.path
            .replace("%", "%25")
            .replace("#", "%23")
            .replace(/^\//, "");

      const params = new URLSearchParams(location.search);
      let subtune = params.get("subtune");
      if (subtune) {
        subtune = parseInt(subtune, 10) - 1;
      } else {
        subtune = 0;
      }

      const href = CATALOG_PREFIX + path;
      handleSongClick(
        href,
        playContext,
        firstSongItem.idx,
        subtune,
      )({
        preventDefault: () => { },
      });
    }
    // Add the dependencies that would trigger the effect when changed
  }, [virtual.items.length]);

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
    <div style={{ position: "relative" }}>
      <div style={virtual.style}>
        {virtual.items.map((item) => {
          // XXX: Escape immediately: the escaped URL is considered canonical.
          //      The URL must be decoded for display from here on out.
          const path =
            item.path === ".."
              ? browsePath.substr(0, browsePath.lastIndexOf("/")) // parent path
              : item.path
                .replace("%", "%25")
                .replace("#", "%23")
                .replace(/^\//, "");
          const name = item.path.split("/").pop();
          const isPlaying = currContext === playContext && currIdx === item.idx;
          const isBackLink = item.path === ".." && prevPageIsParentDir;
          let analysis =
            analyses && analyses[path] && Object.values(analyses[path]);
          if (analysis && analysis[0]) {
            analysis = analysis[0];
          }

          if (item.type === "directory") {
            return (
              <div key={name} className="BrowseList-row">
                <div className="BrowseList-colName">
                  <DirectoryLink
                    dim={!analysis}
                    to={"/browse/" + path}
                    search={search}
                    isBackLink={isBackLink}
                    history={history}
                  >
                    {name}
                  </DirectoryLink>
                </div>
                {analysis && (
                  <div>
                    {Object.entries(analysis).map(([index, piece]) => {
                      const realIndex = parseInt(index, 10) + 1;
                      const modulations = Object.entries(
                        piece.modulations || {},
                      );
                      return (
                        <DirectoryLink
                          key={realIndex}
                          dim={new Boolean(analysis)}
                          to={"/browse/" + path}
                          search={`?subtune=${realIndex}`}
                        >
                          <div
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#444',
                              border: '1px solid white',
                              margin: '3px',
                              padding: '0px',
                              fontFamily: "Helvetica, sans-serif",
                              fontSize: "12pt",
                              color: "white",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {piece.comment && (
                                <Badge color="#cc4">{piece.comment}</Badge>
                              )}
                              {(piece.beatsPerMeasure ?? 4) !== 4 && <Badge color="#99f">{`${piece.beatsPerMeasure}/`}</Badge>}
                              {piece.tags && piece.tags.length > 0 && (
                                <Badge>{piece.tags.join(",")}</Badge>
                              )}
                              {piece.romanNumerals && (
                                <RomanNumerals
                                  romanNumerals={piece.romanNumerals}
                                />
                              )}
                              {piece.basedOn && (
                                <Badge color="#cfc">{piece.basedOn}</Badge>
                              )}
                              {modulations.length > 0 && (
                                <Badge color="#fcc">
                                  {"mod: " +
                                    modulations
                                      .map(([measure, newTonic]) =>
                                        formatModulation(newTonic, piece.tonic),
                                      )
                                      .join(", ")}
                                </Badge>
                              )}
                              {/* {`[${realIndex}]`} */}
                            </div>
                          </div>
                        </DirectoryLink>
                      );
                    })}
                  </div>
                )}
                {/* className="BrowseList-colDir" */}
                {/* <div className="BrowseList-colCount" title={`Contains ${item.numChildren} direct child items`}>
                  {item.numChildren}
                </div>
                <div className="BrowseList-colSize" title={`Directory size is ${item.size} bytes (recursive)`}>
                  {item.size != null && bytes(item.size, { unitSeparator: ' ' })}
                </div> */}
              </div>
            );
          } else {
            const href = CATALOG_PREFIX + path;
            return (
              <div
                key={name}
                className={
                  isPlaying
                    ? "Song-now-playing BrowseList-row"
                    : "BrowseList-row"
                }
              >
                <div className="BrowseList-colName">
                  {/* {favorites &&
                      <FavoriteButton isFavorite={favorites.includes(href)}
                                      href={href}
                                      toggleFavorite={toggleFavorite}/>} */}
                  <a
                    onClick={(e) =>
                      handleSongClick(href, playContext, item.idx)(e)
                    }
                    href={href}
                  >
                    {name}
                  </a>
                </div>
                {/* <div className="BrowseList-colSize">
                  {bytes(item.size, { unitSeparator: " " })}
                </div> */}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
