import * as React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Browse = ({ browsePath, listing, fetchDirectory, analyses }) => {
  useEffect(() => {
    const fetchData = () => {
      if (!listing) {
        fetchDirectory(browsePath);
      }
    };
    fetchData();
  }, [listing, fetchDirectory, browsePath]);

  const items = listing || [];

  return (
    <div
      style={{
        height: "100%",
        overflow: "scroll",
        margin: 0,
      }}
    >
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
            const { path } = item;
            const name = path.slice(path.lastIndexOf("/") + 1);

            return item.type === "directory" ? (
              <div
                key={index}
                className={
                  "BrowseList-row" +
                  (items.length > 4 ? " BrowseList-row-mainPage" : "")
                }
              >
                <div className="BrowseList-colName">
                  <Link
                    to={`/browse${path}`}
                    className={
                      Object.keys(analyses).some((key) =>
                        key.startsWith(`c${path}`),
                      )
                        ? ""
                        : "DirectoryLink-dim"
                    }
                  >
                    {name}
                  </Link>
                </div>
              </div>
            ) : (
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
                      style={{
                        color: analyses[`c${item.path}`] ? "#ff0" : "#aaa",
                      }}
                    >
                      {name}
                    </a>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Browse;
