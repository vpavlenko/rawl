import * as React from "react";
import { useEffect } from "react";
import BrowseList from "./BrowseList";

const Browse = ({ browsePath, listing, fetchDirectory, analyses }) => {
  useEffect(() => {
    const fetchData = () => {
      if (!listing) {
        fetchDirectory(browsePath);
      }
    };
    fetchData();
  }, [browsePath, listing, fetchDirectory]);

  return (
    <div
      style={{
        height: "100%",
        overflow: "scroll",
        margin: 0,
      }}
    >
      <BrowseList
        browsePath={browsePath}
        items={listing || []}
        analyses={analyses}
      />
    </div>
  );
};

export default Browse;
