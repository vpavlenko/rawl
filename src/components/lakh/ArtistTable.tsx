import React, { useState } from "react";
import styled from "styled-components";
import { ARTIST_ERAS, ARTIST_GENRES, artistProfile } from "./artistFacets";

const Matrix = styled.div`
  background: #000;
  width: fit-content;
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
    color: #7aafff;
  }
  thead {
    position: sticky;
    top: 0;
    z-index: 3;
  }
  thead th {
    border-bottom: 1px solid #888;
    box-shadow: 0 1px 0 #888;
    position: sticky;
    top: 0;
    z-index: 2;
  }
  tbody th {
    white-space: pre-line;
    border-right: 1px solid #888;
    box-shadow: 1px 0 0 #888;
    position: sticky;
    left: 0;
    z-index: 1;
  }
  thead th:first-child {
    border-right: 1px solid #888;
    box-shadow: 0 1px 0 #888, 1px 0 0 #888;
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
const ComposerSection = styled.section`
  margin-top: 24px;
  h2 {
    margin: 0 0 10px;
    color: #eee;
    font-size: 17px;
    font-weight: normal;
  }
`;

const formatGenreLabel = (label: string) =>
  label.toLowerCase().replace(/\s*[,&]\s*/g, "\n");

export default function ArtistTable<T extends { name: string }>({
  artists,
  renderArtist,
  songCount,
  hasAnnotations,
}: {
  artists: T[];
  renderArtist: (artist: T) => React.ReactNode;
  songCount: (artist: T) => number;
  hasAnnotations: (artist: T) => boolean;
}) {
  const [expandedCells, setExpandedCells] = useState<Set<string>>(
    () => new Set(),
  );
  const profiles = artists.map((artist) => ({
    artist,
    annotated: hasAnnotations(artist),
    ...artistProfile(artist.name),
  }));
  const composers = profiles
    .filter((item) => item.genre === "shelf-classical")
    .sort(
      (a, b) =>
        songCount(b.artist) - songCount(a.artist) ||
        a.artist.name.localeCompare(b.artist.name),
    );
  const matches = profiles.filter((item) => item.genre !== "shelf-classical");
  const columns = ARTIST_ERAS.filter((column) => column.id !== "unassigned");
  const rows = ARTIST_GENRES.map((row) => {
    const occupied = columns
      .map((column, index) =>
        matches.some((item) => item.genre === row.id && item.era === column.id)
          ? index
          : -1,
      )
      .filter((index) => index >= 0);
    return { ...row, occupied };
  })
    .filter((row) => row.occupied.length > 0)
    .sort(
      (a, b) =>
        a.occupied[0] - b.occupied[0] ||
        a.occupied[a.occupied.length - 1] - b.occupied[b.occupied.length - 1],
    );
  // Generic folders remain accessible without inventing an era or adding a
  // separate undated column. They span the era columns below the dated rows.
  const undatedRows = ARTIST_GENRES.map((row) => ({
    ...row,
    artists: matches
      .filter((item) => item.genre === row.id && item.era === "unassigned")
      .sort(
        (a, b) =>
          Number(b.annotated) - Number(a.annotated) ||
          songCount(b.artist) - songCount(a.artist) ||
          a.artist.name.localeCompare(b.artist.name),
      ),
  })).filter((row) => row.artists.length > 0);
  return (
    <>
      {artists.length === 0 ? (
        <p>No artists.</p>
      ) : (
        matches.length > 0 && (
          <Matrix
            role="region"
            aria-label="Artists by genre and era"
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col" aria-label="Genre" />
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
                    <th scope="row">{formatGenreLabel(row.label)}</th>
                    {columns.map((column) => {
                      const cell = matches
                        .filter(
                          (item) =>
                            item.genre === row.id && item.era === column.id,
                        )
                        .sort(
                          (a, b) =>
                            Number(b.annotated) - Number(a.annotated) ||
                            songCount(b.artist) - songCount(a.artist) ||
                            a.artist.name.localeCompare(b.artist.name),
                        );
                      const cellKey = `${row.id}/${column.id}`;
                      const expanded = expandedCells.has(cellKey);
                      return (
                        <td key={column.id}>
                          {cell.length > 0 && (
                            <>
                              <Artists $table>
                                {(expanded || cell.length <= 11
                                  ? cell
                                  : cell.slice(0, 10)
                                ).map(({ artist }) => renderArtist(artist))}
                              </Artists>
                              {!expanded && cell.length > 11 && (
                                <button
                                  type="button"
                                  aria-label={`Show all ${cell.length} ${row.label} artists, ${column.label}`}
                                  onClick={() => {
                                    setExpandedCells(
                                      (current) =>
                                        new Set([...current, cellKey]),
                                    );
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
                {undatedRows.map((row) => {
                  const cellKey = `${row.id}/undated`;
                  const expanded = expandedCells.has(cellKey);
                  return (
                    <tr key={cellKey}>
                      <th scope="row">{formatGenreLabel(row.label)}</th>
                      <td
                        colSpan={columns.length}
                        aria-label="Entries without a dated era"
                      >
                        <Artists $table>
                          {(expanded || row.artists.length <= 11
                            ? row.artists
                            : row.artists.slice(0, 10)
                          ).map(({ artist }) => renderArtist(artist))}
                        </Artists>
                        {!expanded && row.artists.length > 11 && (
                          <button
                            type="button"
                            aria-label={`Show all ${row.artists.length} undated ${row.label} entries`}
                            onClick={() =>
                              setExpandedCells(
                                (current) => new Set([...current, cellKey]),
                              )
                            }
                          >
                            ...
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Matrix>
        )
      )}
      {composers.length > 0 && (
        <ComposerSection aria-labelledby="classical-composers">
          <h2 id="classical-composers">Classical & historical composers</h2>
          <Artists>
            {composers.map(({ artist }) => renderArtist(artist))}
          </Artists>
        </ComposerSection>
      )}
    </>
  );
}
