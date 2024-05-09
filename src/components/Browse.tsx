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
  }, [listing, fetchDirectory, browsePath]);

  return (
    <div
      style={{
        height: "100%",
        overflow: "scroll",
        margin: 0,
      }}
    >
      <BrowseList items={listing || []} analyses={analyses} />
    </div>
  );
};

export default Browse;
