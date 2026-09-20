import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import { FOOTER_HEIGHT } from "../AppFooter";
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
const Attribution = styled.p`
  position: fixed;
  bottom: ${FOOTER_HEIGHT + 1}px;
  left: 0;
  right: 0;
  z-index: 4;
  margin: 0;
  padding: 8px 24px;
  background: var(--background, #000);
  color: #888;
  font-size: 13px;
  line-height: 1.5;
  @media (max-width: 600px) {
    padding-inline: 12px;
  }
`;
const Heading = styled.div<{ $directory: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 16px;
  margin-bottom: 14px;
  > div {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px 16px;
  }
  @media (min-width: 900px) {
    ${({ $directory }) =>
      $directory &&
      `
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px minmax(0, 1fr);
      align-items: center;
    `}
  }
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
const ArtistSearch = styled.input`
  margin-inline: auto;
  width: 280px;
  max-width: 100%;
  min-width: 0;
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
  &:focus-visible {
    outline: 2px solid #ffe45c;
    outline-offset: 2px;
  }
  @media (max-width: 600px) {
    width: 100%;
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
const SearchResults = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  > li {
    margin-bottom: 14px;
  }
  ul {
    list-style: none;
    padding-left: 20px;
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
        {artistName && trackName && (
          <TrackHeading aria-label="Track information">
            <h1>
              <span className="artist">
                {artist ? (
                  <Link to={lakhArtistUrl(artist)}>
                    {canonicalArtistName(artistName)}
                  </Link>
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
            usePageScroll
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
  const attributionRef = useRef<HTMLParagraphElement>(null);
  const [attributionHeight, setAttributionHeight] = useState(0);
  useEffect(() => {
    const element = attributionRef.current;
    if (!element) return;
    const updateHeight = () =>
      setAttributionHeight(element.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
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
  const [artistQuery, setArtistQuery] = useState("");
  const artistSearch = artistQuery.trim().toLocaleLowerCase();
  const matchingSongs = useMemo(() => {
    const matches = new Map<
      string,
      { source: LakhArtist; file: string; title: string }[]
    >();
    if (!artistSearch) return matches;
    directoryArtists.forEach((item) => {
      const songs = new Map<
        string,
        { source: LakhArtist; file: string; title: string }
      >();
      item.members.forEach((source) =>
        source.tracks.forEach((file) => {
          const title = file.replace(/(?:\.\d+)?\.mid$/i, "");
          const identity = songIdentity(file);
          if (
            title.toLocaleLowerCase().includes(artistSearch) &&
            !songs.has(identity)
          ) {
            songs.set(identity, { source, file, title });
          }
        }),
      );
      if (songs.size) matches.set(item.name, Array.from(songs.values()));
    });
    return matches;
  }, [directoryArtists, artistSearch]);
  const visibleArtists = directoryArtists.filter(
    (item) =>
      item.name.toLocaleLowerCase().includes(artistSearch) ||
      item.members.some((member) =>
        member.name.toLocaleLowerCase().includes(artistSearch),
      ) ||
      matchingSongs.has(item.name),
  );
  const annotated = useMemo(
    () => new Set(Object.keys(analyses).filter((key) => !!analyses[key])),
    [analyses],
  );
  const annotatedSongs = (item: DirectoryArtist) =>
    countSongs(
      item.members.flatMap((member) =>
        member.tracks.filter((file) =>
          annotated.has(lakhAnalysisKey(member.name, file)),
        ),
      ),
    );
  // Display one song list while retaining each file's source for playback and
  // annotations. Colliding filenames become additional display-only versions.
  const trackSources = new Map<string, { source: LakhArtist; file: string }>();
  const sources = artist ? [artist, ...relatedArtists] : [];
  const reservedNames = new Set(sources.flatMap((source) => source.tracks));
  sources.forEach((source) =>
    source.tracks.forEach((file) => {
      let displayFile = file;
      if (trackSources.has(displayFile)) {
        const title = file.replace(/(?:\.\d+)?\.mid$/i, "");
        let version = 1;
        do {
          displayFile = `${title}.${version++}.mid`;
        } while (
          reservedNames.has(displayFile) ||
          trackSources.has(displayFile)
        );
      }
      trackSources.set(displayFile, { source, file });
    }),
  );
  const isAnnotatedTrack = (displayFile: string) => {
    const track = trackSources.get(displayFile);
    return (
      !!track && annotated.has(lakhAnalysisKey(track.source.name, track.file))
    );
  };
  const tracks = Array.from(trackSources.keys());
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
          } · ${count} annotated${tags.length ? ` · ${tags.join(" · ")}` : ""}`}
        >
          {highlightMatches(item.name, artistSearch)}
          {songCount > 1 && (
            <small aria-label={`${songCount} songs, ${count} annotated`}>
              {songCount}
            </small>
          )}
        </Entry>
        {!artist && !!matchingSongs.get(item.name)?.length && (
          <ul>
            {matchingSongs.get(item.name)!.map(({ source, file, title }) => (
              <li key={songIdentity(file)}>
                <Entry
                  to={lakhTrackUrl(source, file)}
                  $folder={false}
                  $annotated={annotated.has(lakhAnalysisKey(source.name, file))}
                >
                  {highlightMatches(title, artistSearch)}
                </Entry>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <Heading $directory={!artist}>
        <div>
          <h1>{artistName ? canonicalArtistName(artistName) : "Lakh"}</h1>
          {!artist && (
            <span>
              {`${directoryArtists.length.toLocaleString()} artists · ${totalSongs.toLocaleString()} songs`}
            </span>
          )}
        </div>
        {!artist && (
          <ArtistSearch
            type="search"
            aria-label="Search artists and songs"
            placeholder="Search artists and songs"
            value={artistQuery}
            onChange={(event) => setArtistQuery(event.target.value)}
          />
        )}
      </Heading>
      {artist ? (
        <>
          <BeatlesDiscography
            groupByAlbum={
              artist.name === "The Beatles" || !!albumGroups?.length
            }
            albumGroups={albumGroups?.length ? albumGroups : null}
            files={tracks}
            allFiles={tracks}
            isAnnotated={isAnnotatedTrack}
            renderTitle={(title) => title}
            renderTrack={(file, label) => {
              const original = trackSources.get(file)!;
              const hasAnalysis = isAnnotatedTrack(file);
              return (
                <Entry
                  to={lakhTrackUrl(original.source, original.file)}
                  $folder={false}
                  $annotated={hasAnalysis}
                  $version={label !== undefined && /^\d+$/.test(label)}
                  title={`${file}${hasAnalysis ? " · Annotated" : ""}`}
                  aria-label={`${file.replace(/\.mid$/i, "")}${
                    hasAnalysis ? " · Annotated" : ""
                  }`}
                >
                  {label || file.replace(/\.mid$/i, "")}
                </Entry>
              );
            }}
          />
        </>
      ) : visibleArtists.length === 0 ? (
        <p role="status">No matching artists or songs.</p>
      ) : artistSearch ? (
        <SearchResults>{visibleArtists.map(renderArtist)}</SearchResults>
      ) : (
        <ArtistTable
          artists={visibleArtists}
          renderArtist={renderArtist}
          songCount={(item) => artistSongCounts.get(item.name) || 0}
          hasAnnotations={(item) => annotatedSongs(item) > 0}
        />
      )}
      {artist && tracks.length === 0 && <p>No tracks.</p>}
      <div
        aria-hidden="true"
        style={{ height: attributionHeight + FOOTER_HEIGHT + 1 }}
      />
      <Attribution ref={attributionRef}>
        Clean subset of the{" "}
        <a href="https://colinraffel.com/projects/lmd/">Lakh MIDI Dataset</a>,
        Colin Raffel (2016).{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
        Artist and title labels are supplied by the dataset and may be
        inaccurate. Includes additional tracks from{" "}
        <a href="https://chiptune.app/browse/MIDI">chiptune.app</a>.
      </Attribution>
    </>
  );
});
