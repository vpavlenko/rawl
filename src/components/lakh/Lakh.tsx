import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import { Analysis } from "../rawl/analysis";
import Rawl from "../rawl/Rawl";
import BeatlesDiscography from "./BeatlesDiscography";
import { groupBeatlesTracks } from "./beatlesReleases";
import {
  LakhCatalog,
  LakhArtist,
  lakhAnalysisKey,
  lakhArtistUrl,
  lakhTrackUrl,
  loadLakhCatalog,
  resolveLakhRoute,
} from "./catalog";

const Page = styled.div`
  padding: 20px 24px;
  color: #ddd;
  nav {
    margin-bottom: 12px;
    color: #999;
  }
  @media (max-width: 600px) {
    padding: 16px 12px;
  }
`;
const Heading = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 16px;
  margin-bottom: 14px;
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: normal;
  }
  span {
    color: #999;
    font-size: 14px;
  }
`;
const TrackHeading = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  h1 {
    margin: 0;
    font-size: 16px;
    color: #fff;
  }
  .artist {
    color: #999;
  }
  .artist a {
    color: inherit;
    text-decoration: none;
  }
  .artist a:hover {
    text-decoration: underline;
  }
  .album {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #999;
    font-size: 14px;
  }
  .album img {
    width: 28px;
    height: 28px;
    object-fit: cover;
    border-radius: 2px;
  }
`;
const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  margin-bottom: 10px;
  input[type="search"] {
    flex: 0 1 560px;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    background: transparent;
    color: #ddd;
    border: 1px solid #666;
    border-radius: 0;
    padding: 8px 10px;
    font: inherit;
    &::placeholder {
      color: #999;
    }
  }
  label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    cursor: pointer;
    font-size: 14px;
  }
  input[type="checkbox"] {
    margin: 0;
    accent-color: #dcb869;
  }
`;
const SortSwitch = styled.div`
  display: inline-flex;
  padding: 3px;
  border: 1px solid #555;
  border-radius: 999px;
  background: #111;
  button {
    border: 0;
    border-radius: 999px;
    padding: 6px 12px;
    background: transparent;
    color: #aaa;
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
    &:hover {
      color: #fff;
    }
    &[aria-pressed="true"] {
      background: #ddd;
      color: #111;
    }
    &:focus-visible {
      outline: 2px solid #ffe45c;
      outline-offset: 2px;
    }
  }
`;
const Legend = styled.p`
  margin: 0 0 18px;
  color: #999;
  font-size: 13px;
`;
const ArtistGroup = styled.section<{ $ranked?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $ranked }) =>
    $ranked ? "minmax(0, 1fr)" : "24px minmax(0, 1fr)"};
  gap: 12px;
  margin-bottom: 16px;
  h2 {
    margin: 0;
    color: #888;
    font-size: 14px;
    font-weight: normal;
    line-height: 26px;
  }
`;
const Entries = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 20px;
  li {
    max-width: 100%;
  }
`;
const ArtistResult = styled.li<{ $hasTracks: boolean }>`
  ${({ $hasTracks }) => $hasTracks && "width: 100%; margin-bottom: 8px;"}
`;
const MatchingTracks = styled(Entries)`
  padding-left: 16px;
  font-size: 14px;
`;
const Entry = styled(Link)<{ $annotated: boolean; $folder: boolean; $version?: boolean }>`
  display: inline;
  line-height: 26px;
  overflow-wrap: anywhere;
  /* Keep annotation colors after navigation: global a:visited is more
     specific than a styled-component class on its own. */
  &, &:link, &:visited {
    color: ${({ $annotated, $folder, $version }) =>
      !$annotated ? ($version ? "#888" : "#ddd") : $folder ? "#f2d18d" : "#ffe45c"};
  }
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
  &:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 3px;
  }
  mark {
    background: #ffe45c;
    color: #000;
  }
  small {
    margin-left: 4px;
    color: #999;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
`;

const countSongs = (files: string[]) =>
  new Set(files.map((file) => file.replace(/(?:\.\d+)?\.mid$/i, ""))).size;

function highlightMatches(text: string, search: string): React.ReactNode {
  if (!search) return text;
  const pattern = new RegExp(
    `(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  return text
    .split(pattern)
    .map((part, index) =>
      index % 2 === 1 ? <mark key={index}>{part}</mark> : part,
    );
}

type Props = {
  ready: boolean;
  loadTrack: (
    artist: string,
    track: string,
    signal: AbortSignal,
  ) => Promise<void>;
};

export default function Lakh({ ready, loadTrack }: Props) {
  const { pathname, search: locationSearch, hash } = useLocation();
  const { analyses, rawlProps, currentMidi, eject } = useContext(AppContext);
  const [catalog, setCatalog] = useState<LakhCatalog | null>(null);
  const [error, setError] = useState("");
  const [loadedKey, setLoadedKey] = useState("");
  const [retry, setRetry] = useState(0);
  const { artist, track, artistSegment, trackSegment, invalid, canonicalPath } =
    // Browser history has already decoded some escapes. Read the original URL
    // here so filenames containing literal percent sequences decode only once.
    resolveLakhRoute(catalog, window.location.pathname);
  const artistName = artist?.name || artistSegment;
  const trackName = track?.replace(/(?:\.\d+)?\.mid$/i, "") || trackSegment;
  const album = useMemo(() => {
    if (artist?.name !== "The Beatles" || !track) return null;
    return groupBeatlesTracks(artist.tracks).find(
      (group) =>
        group.title !== "Other recordings & medleys" &&
        group.songs.some((song) => song.files.includes(track)),
    );
  }, [artist, track]);
  const analysisKey = track ? lakhAnalysisKey(artistName, track) : "";
  const redirecting = !!canonicalPath && pathname !== canonicalPath;
  const pageTitle =
    track && artist
      ? `${trackName} - ${artist.name}`
      : artist
      ? `${artist.name} - Lakh`
      : "Lakh - Rawl";

  useEffect(() => {
    const previousTitle = document.title;
    document.title = pageTitle;
    return () => {
      document.title = previousTitle;
    };
  }, [pageTitle]);

  useEffect(() => {
    let active = true;
    setError("");
    loadLakhCatalog()
      .then((data) => {
        if (active) setCatalog(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [retry]);

  useEffect(() => {
    setError("");
  }, [pathname]);
  useEffect(() => {
    if (!ready || !track || redirecting) return;
    const controller = new AbortController();
    setLoadedKey("");
    loadTrack(artistName, track, controller.signal)
      .then(() => {
        if (!controller.signal.aborted) setLoadedKey(analysisKey);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      });
    return () => {
      controller.abort();
      eject();
    };
  }, [
    ready,
    artistName,
    track,
    analysisKey,
    loadTrack,
    eject,
    retry,
    redirecting,
  ]);

  if (redirecting) {
    return (
      <Redirect
        to={{ pathname: canonicalPath, search: locationSearch, hash }}
      />
    );
  }

  return (
    <>
      <Page>
        {artistName && (
          <TrackHeading aria-label="Track information">
            <h1>
              <span className="artist">
                {artist ? (
                  <Link to={lakhArtistUrl(artist)}>{artistName}</Link>
                ) : (
                  artistName
                )}
                {track && ". "}
              </span>
              {track && trackName}
            </h1>
            {album && (
              <span className="album">
                {album.cover && (
                  <img
                    key={album.cover}
                    src={album.cover}
                    alt={`${album.title} album cover`}
                    width={28}
                    height={28}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                )}
                {album.title} ({album.date.slice(0, 4)})
              </span>
            )}
          </TrackHeading>
        )}
        {error ? (
          <p role="alert">
            {error}{" "}
            <button
              onClick={() => {
                setError("");
                setRetry((value) => value + 1);
              }}
            >
              Retry
            </button>
          </p>
        ) : !catalog ? (
          <p>Loading Lakh…</p>
        ) : invalid ? (
          <p>
            Invalid Lakh URL. <Link to="/lakh/">Browse artists</Link>
          </p>
        ) : artistName && !artist ? (
          <p>
            Artist not found. <Link to="/lakh/">Browse artists</Link>
          </p>
        ) : trackName && !track ? (
          <p>Track not found.</p>
        ) : track ? (
          loadedKey !== analysisKey ? (
            <p role="status">Loading {trackName}…</p>
          ) : null
        ) : (
          <Directory
            key={artistName}
            catalog={catalog}
            artist={artist}
            analyses={analyses}
          />
        )}
      </Page>
      {track &&
        loadedKey === analysisKey &&
        currentMidi?.analysisKey === analysisKey &&
        rawlProps && (
          <Rawl
            {...rawlProps}
            key={analysisKey}
            savedAnalysis={analyses[analysisKey] ?? null}
          />
        )}
    </>
  );
}

// Playback time updates the app context ten times a second. Keep the large
// directory independent of those updates.
const Directory = React.memo(function Directory({
  catalog,
  artist,
  analyses,
}: {
  catalog: LakhCatalog;
  artist?: LakhArtist;
  analyses: Record<string, Analysis>;
}) {
  const artistName = artist?.name || "";
  const artistSongCounts = useMemo(
    () => new Map(catalog.artists.map((item) => [item.name, countSongs(item.tracks)])),
    [catalog],
  );
  const totalSongs = useMemo(
    () => Array.from(artistSongCounts.values()).reduce((sum, count) => sum + count, 0),
    [artistSongCounts],
  );
  const songCounts = useMemo(() => {
    if (artist?.name !== "The Beatles") return null;
    const groups = groupBeatlesTracks(artist.tracks);
    const ungrouped = groups.find(
      (group) => group.title === "Other recordings & medleys",
    )?.songs.length || 0;
    const total = groups.reduce((sum, group) => sum + group.songs.length, 0);
    return { total, grouped: total - ungrouped, ungrouped };
  }, [artist]);
  const [query, setQuery] = useState("");
  const [annotatedOnly, setAnnotatedOnly] = useState(false);
  const [artistSort, setArtistSort] = useState("name");
  const annotated = useMemo(
    () => new Set(Object.keys(analyses).filter((key) => !!analyses[key])),
    [analyses],
  );
  const search = query.trim().toLocaleLowerCase();
  const counts = (name: string, tracks: string[]) =>
    tracks.filter((file) => annotated.has(lakhAnalysisKey(name, file))).length;
  const matchingTracks = new Map<string, string[]>();
  if (search && !artist) {
    catalog.artists.forEach((item) => {
      matchingTracks.set(
        item.name,
        item.tracks.filter(
          (file) =>
            file.toLocaleLowerCase().includes(search) &&
            (!annotatedOnly || annotated.has(lakhAnalysisKey(item.name, file))),
        ),
      );
    });
  }
  const visibleArtists =
    catalog?.artists.filter(
      (item) =>
        (!annotatedOnly || counts(item.name, item.tracks) > 0) &&
        (item.name.toLocaleLowerCase().includes(search) ||
          !!matchingTracks.get(item.name)?.length),
    ) || [];
  const visibleTracks =
    artist?.tracks.filter(
      (file) =>
        (!annotatedOnly || annotated.has(lakhAnalysisKey(artistName, file))) &&
        file.toLocaleLowerCase().includes(search),
    ) || [];

  const artistGroups = new Map<string, LakhArtist[]>();
  if (artistSort === "songs") {
    visibleArtists.sort(
      (a, b) =>
        artistSongCounts.get(b.name)! - artistSongCounts.get(a.name)! ||
        a.name.localeCompare(b.name),
    );
  }
  visibleArtists.forEach((item) => {
    const initial = item.name
      .replace(/^[^a-z0-9]+/i, "")
      .charAt(0)
      .toUpperCase();
    const letter = artistSort === "songs" ? "" : /^[A-Z]$/.test(initial) ? initial : "#";
    const group = artistGroups.get(letter) || [];
    group.push(item);
    artistGroups.set(letter, group);
  });

  return (
    <>
      <Heading>
        <h1>{artistName || "Lakh"}</h1>
        <span>
          {artist ? (
            <>
              {artist.tracks.length.toLocaleString()} files ·{" "}
              {songCounts && (
                <>
                  {songCounts.total.toLocaleString()} songs ({songCounts.grouped} in
                  albums, {songCounts.ungrouped} ungrouped) ·{" "}
                </>
              )}
              <span style={{ color: "#ffe45c" }}>
                {counts(artist.name, artist.tracks)} annotated
              </span>
            </>
          ) : (
            `${catalog.artists.length.toLocaleString()} artists · ${totalSongs.toLocaleString()} songs`
          )}
        </span>
      </Heading>
      <Filters>
        <input
          type="search"
          aria-label={artist ? "Search tracks" : "Search artists or tracks"}
          placeholder={artist ? "Search tracks" : "Search artists or tracks"}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={annotatedOnly}
            onChange={(event) => setAnnotatedOnly(event.target.checked)}
          />
          Annotated only
        </label>
        {!artist && (
          <SortSwitch role="group" aria-label="Sort artists by">
            <button
              type="button"
              aria-pressed={artistSort === "name"}
              onClick={() => setArtistSort("name")}
            >
              Artist name
            </button>
            <button
              type="button"
              aria-pressed={artistSort === "songs"}
              onClick={() => setArtistSort("songs")}
            >
              Songs (most first)
            </button>
          </SortSwitch>
        )}
      </Filters>
      {!artist && (
        <Legend>
          <span style={{ color: "#f2d18d" }}>Gold</span> artists have
          annotated songs · Numbers show song counts.
        </Legend>
      )}
      {artist ? (
        <BeatlesDiscography
          groupByAlbum={artist.name === "The Beatles"}
          files={visibleTracks}
          allFiles={artist.tracks}
          isAnnotated={(file) =>
            annotated.has(lakhAnalysisKey(artist.name, file))
          }
          renderTitle={(title) => highlightMatches(title, search)}
          renderTrack={(file, label) => {
            const hasAnalysis = annotated.has(
              lakhAnalysisKey(artist.name, file),
            );
            return (
              <Entry
                to={lakhTrackUrl(artist, file)}
                $folder={false}
                $annotated={hasAnalysis}
                $version={label !== undefined && /^\d+$/.test(label)}
                title={`${file}${hasAnalysis ? " · Annotated" : ""}`}
                aria-label={`${file.replace(/\.mid$/i, "")}${
                  hasAnalysis ? " · Annotated" : ""
                }`}
              >
                {highlightMatches(label || file.replace(/\.mid$/i, ""), search)}
              </Entry>
            );
          }}
        />
      ) : (
        Array.from(artistGroups)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([letter, items]) => (
            <ArtistGroup
              key={letter}
              $ranked={artistSort === "songs"}
              aria-label={artistSort === "songs" ? "Artists by song count" : `${letter} artists`}
            >
              {letter && <h2>{letter}</h2>}
              <Entries>
                {items.map((item) => {
                  const count = countSongs(item.tracks.filter(
                    (file) => annotated.has(lakhAnalysisKey(item.name, file)),
                  ));
                  const songCount = artistSongCounts.get(item.name)!;
                  const tracks = matchingTracks.get(item.name) || [];
                  return (
                    <ArtistResult
                      key={item.name}
                      $hasTracks={tracks.length > 0}
                    >
                      <Entry
                        to={lakhArtistUrl(item)}
                        $folder
                        $annotated={count > 0}
                        title={`${songCount} ${
                          songCount === 1 ? "song" : "songs"
                        } · ${count} annotated`}
                      >
                        {highlightMatches(item.name, search)}
                        {songCount > 1 && (
                          <small
                            aria-label={`${songCount} songs, ${count} annotated`}
                          >
                            {songCount}
                          </small>
                        )}
                      </Entry>
                      {tracks.length > 0 && (
                        <MatchingTracks
                          aria-label={`Matching tracks by ${item.name}`}
                        >
                          {tracks.map((file) => {
                            const hasAnalysis = annotated.has(
                              lakhAnalysisKey(item.name, file),
                            );
                            return (
                              <li key={file}>
                                <Entry
                                  to={lakhTrackUrl(item, file)}
                                  $folder={false}
                                  $annotated={hasAnalysis}
                                  title={hasAnalysis ? "Annotated" : undefined}
                                >
                                  {highlightMatches(
                                    file.replace(/\.mid$/i, ""),
                                    search,
                                  )}
                                </Entry>
                              </li>
                            );
                          })}
                        </MatchingTracks>
                      )}
                    </ArtistResult>
                  );
                })}
              </Entries>
            </ArtistGroup>
          ))
      )}
      {(artist ? visibleTracks : visibleArtists).length === 0 && (
        <p>No matches.</p>
      )}
      <p
        style={{ color: "#888", fontSize: 13, lineHeight: 1.5, marginTop: 24 }}
      >
        Clean subset of the{" "}
        <a href="https://colinraffel.com/projects/lmd/">Lakh MIDI Dataset</a>,
        Colin Raffel (2016).{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
        Artist and title labels are supplied by the dataset and may be
        inaccurate. Includes additional tracks from{" "}
        <a href="https://chiptune.app/browse/MIDI">chiptune.app</a>.
      </p>
    </>
  );
});
