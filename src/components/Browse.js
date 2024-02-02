import React, { useEffect } from "react";
import BrowseList from "./BrowseList";

const Browse = ({
  browsePath,
  listing,
  fetchDirectory,
  playContext,
  currContext,
  currIdx,
  handleSongClick,
  analyses,
  searchPath,
}) => {
  useEffect(() => {
    if (!listing) {
      fetchDirectory(browsePath);
    }
  }, [browsePath, listing, fetchDirectory]);

  const searchParams = new URLSearchParams(window.location.search);

  return (
    <div
      style={{
        height: searchParams.get("song") ? "0px" : "100%",
        overflow: "scroll",
        margin: 0,
      }}
    >
      <BrowseList
        browsePath={browsePath}
        playContext={playContext}
        items={listing || []}
        currContext={currContext}
        currIdx={currIdx}
        handleSongClick={handleSongClick}
        analyses={analyses}
        searchPath={searchPath}
      />
    </div>
  );
};

export default Browse;
