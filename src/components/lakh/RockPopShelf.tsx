import React, { useState } from "react";
import styled from "styled-components";
import {
  ROCK_POP_ERAS,
  ROCK_POP_GENRES,
  RockPopEra,
  RockPopGenre,
  rockPopProfile,
} from "./rockPopFacets";

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  margin-bottom: 10px;
  font-size: 13px;
  label {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  select,
  button {
    background: #151515;
    color: #ddd;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 6px 8px;
    font: inherit;
    max-width: 100%;
  }
  label {
    max-width: 100%;
  }
  select {
    min-width: 0;
  }
  button {
    cursor: pointer;
  }
  button[aria-pressed="true"] {
    border-color: #dcb869;
    color: #f2d18d;
  }
  :focus-visible {
    outline: 2px solid #ffe45c;
    outline-offset: 2px;
  }
`;
const Matrix = styled.div`
  background: #000;
  overflow: auto;
  max-height: 75vh;
  width: fit-content;
  max-width: 100%;
  border: 1px solid #383838;
  border-radius: 4px;
  &:focus-visible {
    outline: 2px solid #ffe45c;
    outline-offset: 2px;
  }
  table {
    border-collapse: separate;
    border-spacing: 0;
    width: max-content;
    font-size: 13px;
  }
  caption {
    text-align: left;
    padding: 10px;
    color: #aaa;
  }
  th,
  td {
    padding: 10px 12px;
    border-right: 1px solid #333;
    border-bottom: 1px solid #333;
    vertical-align: top;
    text-align: left;
    white-space: nowrap;
  }
  th {
    background: #000;
    font-weight: normal;
    color: #eee;
  }
  thead th {
    position: sticky;
    top: 0;
    z-index: 2;
  }
  tbody th {
    position: sticky;
    left: 0;
    z-index: 1;
  }
  thead th:first-child {
    left: 0;
    z-index: 3;
  }
  td {
    background: #000;
  }
  td:empty {
    background: #000;
  }
  tr:last-child > * {
    border-bottom: 0;
  }
  tr > :last-child {
    border-right: 0;
  }
  button {
    border: 0;
    padding: 5px 0;
    background: transparent;
    color: #999;
    font: inherit;
    cursor: pointer;
    text-decoration: none;
  }
  button:focus-visible {
    outline: 2px solid #ffe45c;
    outline-offset: 2px;
  }
  @media (max-width: 600px) {
    th,
    td {
      padding: 8px;
    }
  }
`;
const Artists = styled.ul<{ $table?: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;
  display: ${({ $table }) => ($table ? "block" : "flex")};
  flex-wrap: wrap;
  gap: 0 20px;
  li {
    max-width: 100%;
  }
  ${({ $table }) =>
    $table &&
    `
    > li {
      margin: 0;
      padding: 0;
      line-height: 1.2;
    }
    > li > a {
      line-height: inherit;
    }
  `}
`;
const Status = styled.p`
  margin: 8px 0 12px;
  color: #999;
  font-size: 13px;
`;

export default function RockPopShelf<T extends { name: string }>({
  artists,
  renderArtist,
  songCount,
}: {
  artists: T[];
  renderArtist: (artist: T) => React.ReactNode;
  songCount: (artist: T) => number;
}) {
  const [genre, setGenre] = useState<RockPopGenre | "all">("all");
  const [era, setEra] = useState<RockPopEra | "all">("all");
  const [tag, setTag] = useState("all");
  const [view, setView] = useState<"table" | "list">("table");
  const tagged = artists.map((artist) => ({
    artist,
    ...rockPopProfile(artist.name),
  }));
  const tags = Array.from(new Set(tagged.flatMap((item) => item.tags))).sort();
  const matches = tagged.filter(
    (item) =>
      (genre === "all" || item.genre === genre) &&
      (era === "all" || item.era === era) &&
      (tag === "all" || item.tags.includes(tag)),
  );
  const rows = ROCK_POP_GENRES.map((row) => {
    const occupied = ROCK_POP_ERAS.map((column, index) =>
      matches.some((item) => item.genre === row.id && item.era === column.id)
        ? index
        : -1,
    ).filter((index) => index >= 0);
    return { ...row, occupied };
  })
    .filter((row) => row.occupied.length > 0)
    .sort(
      (a, b) =>
        a.occupied[0] - b.occupied[0] ||
        a.occupied[a.occupied.length - 1] - b.occupied[b.occupied.length - 1],
    );
  const columns = ROCK_POP_ERAS.filter(
    (column) =>
      (era === "all" || era === column.id) &&
      (column.id !== "unassigned" ||
        matches.some((item) => item.era === column.id)),
  );
  const focused = genre !== "all" && era !== "all";
  return (
    <>
      <Controls>
        <label>
          Genre
          <select
            value={genre}
            onChange={(event) =>
              setGenre(event.target.value as RockPopGenre | "all")
            }
          >
            <option value="all">All genres</option>
            {ROCK_POP_GENRES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Era
          <select
            value={era}
            onChange={(event) =>
              setEra(event.target.value as RockPopEra | "all")
            }
          >
            <option value="all">All eras</option>
            {ROCK_POP_ERAS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tag
          <select value={tag} onChange={(event) => setTag(event.target.value)}>
            <option value="all">All tags</option>
            {Array.from(new Set([...tags, ...(tag === "all" ? [] : [tag])]))
              .sort()
              .map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
          </select>
        </label>
        <div role="group" aria-label="Rock and pop layout">
          <button
            type="button"
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
          >
            Table
          </button>{" "}
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            List
          </button>
        </div>
        {(genre !== "all" || era !== "all" || tag !== "all") && (
          <button
            type="button"
            onClick={() => {
              setGenre("all");
              setEra("all");
              setTag("all");
            }}
          >
            Clear genre, era & tag
          </button>
        )}
      </Controls>
      <Status role="status">
        {matches.length.toLocaleString()}{" "}
        {matches.length === 1 ? "artist" : "artists"}
      </Status>
      {matches.length === 0 ? (
        <p>No artists match these genre, era and tag filters.</p>
      ) : view === "list" ? (
        <Artists>{matches.map(({ artist }) => renderArtist(artist))}</Artists>
      ) : (
        <Matrix
          role="region"
          aria-label="Rock and pop artists by genre and era"
          tabIndex={0}
        >
          <table>
            <caption>
              Genre × era · Scroll to explore eras. Each cell previews up to
              five artists by song count; choose “...” to open the full group.
            </caption>
            <thead>
              <tr>
                <th scope="col">Genre / era</th>
                {columns.map((column) => (
                  <th key={column.id} scope="col">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.label}</th>
                  {columns.map((column) => {
                    const cell = matches
                      .filter(
                        (item) =>
                          item.genre === row.id && item.era === column.id,
                      )
                      .sort(
                        (a, b) =>
                          songCount(b.artist) - songCount(a.artist) ||
                          a.artist.name.localeCompare(b.artist.name),
                      );
                    return (
                      <td key={column.id}>
                        {cell.length > 0 && (
                          <>
                            <Artists $table>
                              {(focused ? cell : cell.slice(0, 5)).map(
                                ({ artist }) => renderArtist(artist),
                              )}
                            </Artists>
                            {!focused && cell.length > 5 && (
                              <button
                                type="button"
                                aria-label={`Show all ${cell.length} ${row.label} artists, ${column.label}`}
                                onClick={() => {
                                  setGenre(row.id);
                                  setEra(column.id);
                                }}
                              >
                                ...
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Matrix>
      )}
    </>
  );
}
