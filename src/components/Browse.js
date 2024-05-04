import React, { useEffect } from "react";
import BrowseList from "./BrowseList";

const Browse = ({
  browsePath,
  listing,
  fetchDirectory,
  playContext,
  handleSongClick,
  analyses,
}) => {
  useEffect(() => {
    const fetchData = () => {
      if (!listing) {
        fetchDirectory(browsePath);
      }
    };
    fetchData();
  }, [browsePath, listing, fetchDirectory]);

  const searchParams = new URLSearchParams(window.location.search);

  return (
    <div
      style={{
        height:
          searchParams.get("song") ||
          searchParams.get("link") ||
          browsePath.startsWith("f/")
            ? "0px"
            : "100%",
        overflow: "scroll",
        margin: 0,
      }}
    >
      <BrowseList
        browsePath={browsePath}
        playContext={playContext}
        items={listing || []}
        handleSongClick={handleSongClick}
        analyses={analyses}
      />
    </div>
  );
};

export default Browse;
