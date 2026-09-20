import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import { Analysis } from "../rawl/analysis";
import Rawl from "../rawl/Rawl";
import BeatlesDiscography from "./BeatlesDiscography";
import ArtistTable from "./ArtistTable";
import { artistProfile } from "./artistFacets";
import { groupBeatlesTracks } from "./beatlesReleases";
import { useAlbumMetadata } from "./albumMetadata";
import { canonicalArtistName } from "./artistShelves";
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
  select {
    background: #111;
    color: #ddd;
    border: 1px solid #555;
    padding: 5px;
    font: inherit;
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
const Legend = styled.p`
  margin: 0 0 18px;
  color: #999;
  font-size: 13px;
`;
const ArtistGroup = styled.section`
  margin-bottom: 28px;
  h2 {
    margin: 0 0 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #333;
    color: #eee;
    font-size: 17px;
    font-weight: normal;
    line-height: 26px;
    small {
      margin-left: 10px;
      color: #888;
      font-size: 12px;
    }
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
const Entry = styled(Link)<{
  $annotated: boolean;
  $folder: boolean;
  $version?: boolean;
}>`
  display: inline;
  line-height: 26px;
  overflow-wrap: anywhere;
  /* Keep annotation colors after navigation: global a:visited is more
     specific than a styled-component class on its own. */
  &,
  &:link,
  &:visited {
    color: ${({ $annotated, $folder, $version }) =>
      !$annotated
        ? $version
          ? "#888"
          : "#ddd"
        : $folder
        ? "#f2d18d"
        : "#ffe45c"};
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

const songIdentity = (file: string) =>
  file
    .replace(/(?:\.\d+)?\.mid$/i, "")
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
const countSongs = (files: string[]) => new Set(files.map(songIdentity)).size;

type DirectoryArtist = LakhArtist & { members: LakhArtist[] };

// Merge the browsing identity only. Files, routes and annotation keys continue
// to belong to their original catalog folders.
function groupArtistAliases(artists: LakhArtist[]): DirectoryArtist[] {
  const groups = new Map<string, LakhArtist[]>();
  artists.forEach((artist) => {
    const name = canonicalArtistName(artist.name);
    groups.set(name, [...(groups.get(name) || []), artist]);
  });
  return Array.from(groups, ([name, members]) => ({
    ...(members.find((member) => member.name === name) || members[0]),
    name,
    tracks: members.flatMap((member) => member.tracks),
    members,
  }));
}

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
  const albumGroups = useAlbumMetadata(artist);
  const album = useMemo(() => {
    if (!artist || !track) return null;
    const groups =
      artist.name === "The Beatles"
        ? groupBeatlesTracks(artist.tracks)
        : albumGroups || [];
    return groups.find(
      (group) =>
        group.title !== "Other recordings & medleys" &&
        group.songs.some((song) => song.files.includes(track)),
    );
  }, [artist, track, albumGroups]);
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
  const albumGroups = useAlbumMetadata(artist);
  const directoryArtists = useMemo(
    () => groupArtistAliases(catalog.artists),
    [catalog],
  );
  const relatedArtists = artist
    ? directoryArtists
        .find((item) => item.name === canonicalArtistName(artist.name))
        ?.members.filter((member) => member.name !== artist.name) || []
    : [];
  const artistSongCounts = useMemo(
    () =>
      new Map(
        directoryArtists.map((item) => [item.name, countSongs(item.tracks)]),
      ),
    [directoryArtists],
  );
  const totalSongs = useMemo(
    () =>
      Array.from(artistSongCounts.values()).reduce(
        (sum, count) => sum + count,
        0,
      ),
    [artistSongCounts],
  );
  const songCounts = useMemo(() => {
    if (artist?.name !== "The Beatles") return null;
    const groups = groupBeatlesTracks(artist.tracks);
    const ungrouped =
      groups.find((group) => group.title === "Other recordings & medleys")
        ?.songs.length || 0;
    const total = groups.reduce((sum, group) => sum + group.songs.length, 0);
    return { total, grouped: total - ungrouped, ungrouped };
  }, [artist]);
  const [query, setQuery] = useState("");
  const [annotatedOnly, setAnnotatedOnly] = useState(false);
  const annotated = useMemo(
    () => new Set(Object.keys(analyses).filter((key) => !!analyses[key])),
    [analyses],
  );
  const search = query.trim().toLocaleLowerCase();
  const counts = (name: string, tracks: string[]) =>
    tracks.filter((file) => annotated.has(lakhAnalysisKey(name, file))).length;
  const annotatedSongs = (item: DirectoryArtist) =>
    countSongs(
      item.members.flatMap((member) =>
        member.tracks.filter((file) =>
          annotated.has(lakhAnalysisKey(member.name, file)),
        ),
      ),
    );
  const visibleTracks =
    artist?.tracks.filter(
      (file) =>
        (!annotatedOnly || annotated.has(lakhAnalysisKey(artistName, file))) &&
        file.toLocaleLowerCase().includes(search),
    ) || [];
  const relatedTracks = relatedArtists.map((source) => ({
    source,
    files: source.tracks.filter(
      (file) =>
        (!annotatedOnly || annotated.has(lakhAnalysisKey(source.name, file))) &&
        file.toLocaleLowerCase().includes(search),
    ),
  }));
  const renderArtist = (item: DirectoryArtist) => {
    const count = annotatedSongs(item);
    const songCount = artistSongCounts.get(item.name)!;
    const tags = artistProfile(item.name).tags;
    return (
      <li key={item.name}>
        <Entry
          to={lakhArtistUrl(item)}
          $folder
          $annotated={count > 0}
          title={`${songCount} ${
            songCount === 1 ? "song" : "songs"
          } · ${count} annotated${tags.length ? ` · ${tags.join(" · ")}` : ""}${
            item.members.length > 1
              ? ` · Also filed as: ${item.members
                  .map((member) => member.name)
                  .join(", ")}`
              : ""
          }`}
        >
          {item.name}
          {songCount > 1 && (
            <small aria-label={`${songCount} songs, ${count} annotated`}>
              {songCount}
            </small>
          )}
        </Entry>
      </li>
    );
  };

  return (
    <>
      <Heading>
        <h1>{artistName ? canonicalArtistName(artistName) : "Lakh"}</h1>
        <span>
          {artist ? (
            <>
              {(
                artist.tracks.length +
                relatedArtists.reduce(
                  (sum, source) => sum + source.tracks.length,
                  0,
                )
              ).toLocaleString()}{" "}
              files ·{" "}
              {songCounts && (
                <>
                  {songCounts.total.toLocaleString()} songs (
                  {songCounts.grouped} in albums, {songCounts.ungrouped}{" "}
                  ungrouped) ·{" "}
                </>
              )}
              <span style={{ color: "#ffe45c" }}>
                {counts(artist.name, artist.tracks) +
                  relatedArtists.reduce(
                    (sum, source) => sum + counts(source.name, source.tracks),
                    0,
                  )}{" "}
                annotated
              </span>
            </>
          ) : (
            `${directoryArtists.length.toLocaleString()} artists · ${totalSongs.toLocaleString()} songs`
          )}
        </span>
      </Heading>
      {artist && (
        <Filters>
          <input
            type="search"
            aria-label="Search tracks"
            placeholder="Search tracks"
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
        </Filters>
      )}
      {!artist && (
        <Legend>
          <span style={{ color: "#f2d18d" }}>Gold</span> artists have annotated
          songs · Numbers beside artists show song counts. Known aliases are
          combined; song counts group matching titles and MIDI versions.
        </Legend>
      )}
      {artist ? (
        <>
          <BeatlesDiscography
            groupByAlbum={
              artist.name === "The Beatles" || !!albumGroups?.length
            }
            albumGroups={albumGroups?.length ? albumGroups : null}
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
                  {highlightMatches(
                    label || file.replace(/\.mid$/i, ""),
                    search,
                  )}
                </Entry>
              );
            }}
          />
          {relatedTracks
            .filter(({ files }) => files.length > 0)
            .map(({ source, files }) => (
              <ArtistGroup key={source.name}>
                <h2>
                  Also filed as{" "}
                  <Link to={lakhArtistUrl(source)}>{source.name}</Link>
                </h2>
                <BeatlesDiscography
                  groupByAlbum={false}
                  files={files}
                  allFiles={source.tracks}
                  isAnnotated={(file) =>
                    annotated.has(lakhAnalysisKey(source.name, file))
                  }
                  renderTitle={(title) => highlightMatches(title, search)}
                  renderTrack={(file, label) => (
                    <Entry
                      to={lakhTrackUrl(source, file)}
                      $folder={false}
                      $annotated={annotated.has(
                        lakhAnalysisKey(source.name, file),
                      )}
                      $version={label !== undefined && /^\d+$/.test(label)}
                    >
                      {highlightMatches(
                        label || file.replace(/\.mid$/i, ""),
                        search,
                      )}
                    </Entry>
                  )}
                />
              </ArtistGroup>
            ))}
        </>
      ) : (
        <ArtistTable
          artists={directoryArtists}
          renderArtist={renderArtist}
          songCount={(item) => artistSongCounts.get(item.name) || 0}
        />
      )}
      {artist &&
        visibleTracks.length +
          relatedTracks.reduce((sum, group) => sum + group.files.length, 0) ===
          0 && <p>No matches.</p>}
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
