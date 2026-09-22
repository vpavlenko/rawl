import React, { useState } from "react";
import styled from "styled-components";
import { beatlesVariantNumber, groupBeatlesTracks } from "./beatlesReleases";
import { AlbumGroup } from "./albumMetadata";

function coverThumbnailUrl(source: string): string {
  // The public CDN handles resizing and caching; no images pass through our servers.
  // 224px keeps the 112px cover sharp on 2x displays without downloading large originals.
  return `https://wsrv.nl/?url=${encodeURIComponent(source)}&w=224&h=224&fit=inside&output=webp&q=80`;
}

const Discography = styled.div`
  font-size: 14px;
  .albums {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
    gap: 28px 32px;
    align-items: start;
  }
  .album {
    min-width: 0;
    border-top: 1px solid #333;
    padding-top: 16px;
  }
  .album header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
  }
  h2 {
    margin: 0;
    font-size: 17px;
    font-weight: normal;
    line-height: 1.4;
  }
  .date {
    display: block;
    color: #999;
    margin-top: 6px;
    font-size: 12px;
  }
  .cover {
    width: 112px;
    height: 112px;
    object-fit: contain;
    border-radius: 3px;
    flex-shrink: 0;
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
    text-align: left;
  }
  .song {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 6px;
    min-width: 0;
  }
  .title,
  .song a {
    line-height: 20px;
  }
  .title {
    overflow-wrap: anywhere;
  }
  .versions {
    display: inline;
  }
  .versions a,
  .more {
    display: inline-block;
    text-align: center;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .more {
    appearance: none;
    border: 0;
    background: none;
    color: #888;
    padding: 0;
    line-height: 20px;
    cursor: pointer;
    opacity: 0;
  }
  .song:hover .more,
  .song:focus-within .more {
    opacity: 1;
  }
  .more:hover {
    color: #ddd;
  }
  .more:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 2px;
  }
  @media (hover: none) {
    .more {
      opacity: 1;
    }
  }
`;

export default function BeatlesDiscography({
  files,
  allFiles,
  isAnnotated,
  renderTitle,
  renderTrack,
  groupByAlbum = true,
  albumGroups,
}: {
  files: string[];
  allFiles: string[];
  isAnnotated: (file: string) => boolean;
  renderTitle: (title: string) => React.ReactNode;
  renderTrack: (file: string, label?: string) => React.ReactNode;
  groupByAlbum?: boolean;
  albumGroups?: AlbumGroup[] | null;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const expandVersions = (key: string) =>
    setExpanded((previous) => new Set([...previous, key]));
  const visible = new Set(files);
  const songsByTitle = new Map<string, string[]>();
  const assignedFiles = new Set(albumGroups?.flatMap((group) =>
    group.songs.flatMap((song) => song.files),
  ));
  if (!groupByAlbum || albumGroups) {
    allFiles.forEach((file) => {
      if (assignedFiles.has(file)) return;
      const title = file.replace(/(?:\.\d+)?\.mid$/i, "");
      const versions = songsByTitle.get(title) || [];
      versions.push(file);
      songsByTitle.set(title, versions);
    });
  }
  const remainingGroup = {
    title: albumGroups ? "Other songs" : "Songs",
    date: "",
    cover: null,
    songs: Array.from(songsByTitle)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, versions]) => ({
        number: 0,
        files: versions.sort((a, b) =>
          beatlesVariantNumber(a) - beatlesVariantNumber(b) || a.localeCompare(b),
        ),
      })),
  };
  const sourceGroups: AlbumGroup[] = albumGroups
    ? [...albumGroups, remainingGroup]
    : groupByAlbum ? groupBeatlesTracks(allFiles) : [remainingGroup];
  const groups = sourceGroups
    .map((group) => ({
      ...group,
      songs: group.songs
        .map((song) => ({
          ...song,
          title: song.files[0].replace(/(?:\.\d+)?\.mid$/i, ""),
          annotatedFile: song.files.find(isAnnotated),
          singleFile: song.files.length === 1 ? song.files[0] : undefined,
          annotatedCount: song.files.filter(isAnnotated).length,
          files: song.files.filter((file) => visible.has(file)),
        }))
        .filter((song) => song.files.length),
    }))
    .filter((group) => group.songs.length);
  if (!groups.length) return null;
  return (
    <Discography>
      <div className={groupByAlbum ? "albums" : undefined}>
        {groups.map((group, groupIndex) => (
          <section className={groupByAlbum ? "album" : undefined} key={group.title} aria-label={group.title}>
            {groupByAlbum && <header>
              {group.cover && (
                <img
                  key={group.cover}
                  className="cover"
                  src={coverThumbnailUrl(group.cover)}
                  alt={`${group.title} album cover`}
                  width={112}
                  height={112}
                  loading={groupIndex < 4 ? "eager" : "lazy"}
                  decoding="async"
                  onError={(event) => {
                    const image = event.currentTarget;
                    // Retry the original once if the CDN is unavailable or rejects the source.
                    if (image.getAttribute("src") !== group.cover) {
                      image.src = group.cover!;
                    } else {
                      image.style.visibility = "hidden";
                    }
                  }}
                />
              )}
              <div>
                <h2>{group.title}</h2>
                <span className="date">
                  {group.date}
                  {group.type && group.type !== "Album" ? ` · ${group.type}` : ""}
                </span>
              </div>
            </header>}
            <ul>
              {group.songs.map((song) => {
                const key = `${group.title}/${song.title}`;
                const hasHiddenVersions =
                  !!song.annotatedFile &&
                  song.files.some((file) => !isAnnotated(file));
                const isExpanded = expanded.has(key);
                const shownFiles = song.files.filter(
                  (file) =>
                    !song.singleFile &&
                    (isExpanded ||
                      !song.annotatedFile ||
                      (song.annotatedCount > 1 && isAnnotated(file))),
                );
                return (
                  <li key={key}>
                    {groupByAlbum && <span className="number">{song.number || "·"}</span>}
                    <span className="song">
                      <span className="title">
                        {song.annotatedFile || song.singleFile
                          ? renderTrack(song.annotatedFile || song.singleFile, song.title)
                          : renderTitle(song.title)}
                      </span>
                      <span className="versions">
                        {shownFiles.map((file, index) => (
                          <React.Fragment key={file}>
                            {index > 0 ? " " : null}
                            {renderTrack(
                              file,
                              String(beatlesVariantNumber(file)),
                            )}
                          </React.Fragment>
                        ))}
                        {hasHiddenVersions && !isExpanded && (
                          <>
                            {shownFiles.length > 0 ? " " : null}
                            <button
                              type="button"
                              className="more"
                              aria-expanded={false}
                              aria-label={`Show unannotated versions of ${song.title}`}
                              title="Show other versions"
                              onClick={() => expandVersions(key)}
                            >
                              …
                            </button>
                          </>
                        )}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Discography>
  );
}
