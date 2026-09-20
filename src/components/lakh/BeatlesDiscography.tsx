import React from "react";
import styled from "styled-components";
import { beatlesVariantNumber, groupBeatlesTracks } from "./beatlesReleases";

const Table = styled.table`
  width: 100%;
  max-width: 1050px;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
  caption {
    text-align: left;
    color: #999;
    font-size: 12px;
    line-height: 1.6;
    padding-bottom: 16px;
  }
  thead th {
    color: #999;
    font-size: 12px;
    font-weight: normal;
    padding: 0 16px 10px 0;
  }
  tbody {
    border-top: 1px solid #333;
  }
  tbody th {
    width: 28%;
    padding: 14px 24px 14px 0;
    vertical-align: top;
    font-weight: normal;
    color: #eee;
    line-height: 1.5;
  }
  tbody th small {
    display: block;
    color: #999;
    margin-top: 5px;
  }
  td {
    padding: 14px 0;
    vertical-align: top;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .number {
    color: #777;
    font-size: 11px;
    min-width: 18px;
    text-align: right;
  }
  .song {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 12px;
  }
  .title {
    line-height: 26px;
  }
  .versions {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0 4px;
  }
  .versions a {
    display: inline-block;
    min-width: 24px;
    text-align: center;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 600px) {
    tbody th {
      width: 32%;
      padding-right: 12px;
      font-size: 13px;
    }
    li {
      gap: 6px;
    }
  }
`;

export default function BeatlesDiscography({
  files,
  allFiles,
  isAnnotated,
  renderTitle,
  renderTrack,
}: {
  files: string[];
  allFiles: string[];
  isAnnotated: (file: string) => boolean;
  renderTitle: (title: string) => React.ReactNode;
  renderTrack: (file: string, label?: string) => React.ReactNode;
}) {
  const visible = new Set(files);
  const groups = groupBeatlesTracks(allFiles)
    .map((group) => ({
      ...group,
      songs: group.songs
        .map((song) => ({
          ...song,
          title: song.files[0].replace(/(?:\.\d+)?\.mid$/i, ""),
          annotatedFile: song.files.find(isAnnotated),
          files: song.files.filter((file) => visible.has(file)),
        }))
        .filter((song) => song.files.length),
    }))
    .filter((group) => group.songs.length);
  if (!groups.length) return null;
  return (
    <Table>
      <caption>
        Albums in release order; songs in album order. Repeated songs appear
        once. Numbers link to MIDI versions; titles link to an annotated version
        when available. Singles follow under Past Masters.
      </caption>
      <thead>
        <tr>
          <th scope="col">Release</th>
          <th scope="col">Tracks</th>
        </tr>
      </thead>
      {groups.map((group) => (
        <tbody key={group.title}>
          <tr>
            <th scope="row">
              {group.title}
              <small>{group.date}</small>
            </th>
            <td>
              <ul>
                {group.songs.map((song) => (
                  <li key={song.files[0]}>
                    <span className="number">{song.number || "·"}</span>
                    <span className="song">
                      <span className="title">
                        {song.annotatedFile
                          ? renderTrack(song.annotatedFile, song.title)
                          : renderTitle(song.title)}
                      </span>
                      <span className="versions">
                        {song.files.map((file) => (
                          <React.Fragment key={file}>
                            {renderTrack(
                              file,
                              String(beatlesVariantNumber(file)),
                            )}
                          </React.Fragment>
                        ))}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        </tbody>
      ))}
    </Table>
  );
}
