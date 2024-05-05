import * as React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import BrowseList from "./BrowseList";
import { processMidiUrls } from "./midiUrls";

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

  const location = useLocation();

  const items = listing || [];
  useEffect(() => {
    processMidiUrls(handleSongClick, location, items, playContext);
  }, [items.length, location]); // eslint-disable-line react-hooks/exhaustive-deps

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
