import { ADMIN_USER_ID, AnnotationVersions } from "../annotationVersions";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import { FOOTER_HEIGHT } from "../AppFooter";
import { HEADER_HEIGHT } from "../AppHeader";
import { Analysis } from "../rawl/analysis";
import Rawl from "../rawl/Rawl";
import BeatlesDiscography from "./BeatlesDiscography";
import ArtistTable from "./ArtistTable";
import { artistProfile } from "./artistFacets";
import { groupBeatlesTracks } from "./beatlesReleases";
import { useAlbumArtistSlugs, useAlbumMetadata } from "./albumMetadata";
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

const Page = styled.div<{ $directory: boolean }>`
  padding: 20px 24px;
  color: #ddd;
  ${({ $directory }) =>
    $directory &&
    `
      box-sizing: border-box;
      min-height: calc(100vh - ${HEADER_HEIGHT} - ${FOOTER_HEIGHT + 1}px);
      min-height: calc(100dvh - ${HEADER_HEIGHT} - ${FOOTER_HEIGHT + 1}px);
      display: flex;
      flex-direction: column;
      > * { flex-shrink: 0; }
    `}
  nav {
    margin-bottom: 12px;
    color: #999;
  }
  @media (max-width: 600px) {
    padding: 16px 12px;
  }
`;
const Attribution = styled.p`
  margin: auto 0 0;
  padding-top: 24px;
  color: #888;
  font-size: 13px;
  line-height: 1.5;
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
const DirectorySearch = styled.input`
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
const SearchPanes = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 12px;
  > section {
    min-width: 0;
  }
  > section:first-child {
    flex: 0 0 calc(50vw - 40px);
  }
  > section:last-child {
    flex: 1 1 0;
  }
  h2 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: normal;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    > section:first-child,
    > section:last-child {
      flex: 0 1 auto;
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
const SearchResults = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  line-height: 22px;
  a {
    line-height: inherit;
  }
  > li {
    margin-bottom: 4px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding-left: 12px;
  }
`;
const Entry = styled(Link)<{
  $annotated: boolean;
  $community?: boolean;
  $hasFewSections?: boolean;
  $folder: boolean;
  $version?: boolean;
  $hasAlbums?: boolean;
}>`
  display: inline;
  ${({ $hasAlbums }) => $hasAlbums && "font-size: 18px;"}
  line-height: 26px;
  overflow-wrap: anywhere;
  /* Keep annotation colors after navigation: global a:visited is more
     specific than a styled-component class on its own. */
  &,
  &:link,
  &:visited {
    color: ${({
      $annotated,
      $community,
      $hasFewSections,
      $folder,
      $version,
    }) =>
      $community
        ? "#69b7ff"
        : !$annotated
        ? $version
          ? "#888"
          : "#ddd"
        : $hasFewSections
        ? "#ff8fbd"
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

function collectTrackSources(sources: LakhArtist[]) {
  // Display one song list while retaining each file's source for playback and
  // annotations. Colliding filenames become additional display-only versions.
  const trackSources = new Map<string, { source: LakhArtist; file: string }>();
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
  return trackSources;
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
  const { analyses, annotationVersions, rawlProps, currentMidi, eject } =
    useContext(AppContext);
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
      <Page $directory={!trackName}>
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
            annotationVersions={annotationVersions}
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
  annotationVersions,
}: {
  catalog: LakhCatalog;
  artist?: LakhArtist;
  analyses: Record<string, Analysis>;
  annotationVersions: AnnotationVersions;
}) {
  const artistName = artist?.name || "";
  const albumGroups = useAlbumMetadata(artist);
  const albumArtistSlugs = useAlbumArtistSlugs();
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
  const [searchQuery, setSearchQuery] = useState("");
  const search = searchQuery.trim().toLocaleLowerCase();
  const matchingSongs = useMemo(() => {
    const matches = new Map<
      string,
      {
        artist: DirectoryArtist;
        tracks: ReturnType<typeof collectTrackSources>;
      }
    >();
    if (!search) return matches;
    directoryArtists.forEach((item) => {
      const tracks = collectTrackSources([
        ...item.members.filter((member) => member.slug === item.slug),
        ...item.members.filter((member) => member.slug !== item.slug),
      ]);
      for (const file of tracks.keys()) {
        const title = file.replace(/(?:\.\d+)?\.mid$/i, "");
        if (!title.toLocaleLowerCase().includes(search)) tracks.delete(file);
      }
      if (tracks.size) matches.set(item.name, { artist: item, tracks });
    });
    return matches;
  }, [directoryArtists, search]);
  const visibleArtists = directoryArtists.filter(
    (item) =>
      item.name.toLocaleLowerCase().includes(search) ||
      item.members.some((member) =>
        member.name.toLocaleLowerCase().includes(search),
      ),
  );
  const communityAnnotated = useMemo(
    () =>
      new Set(
        Object.keys(annotationVersions).filter((key) =>
          Object.keys(annotationVersions[key]).some(
            (owner) => owner !== ADMIN_USER_ID,
          ),
        ),
      ),
    [annotationVersions],
  );
  const artistHasCommunity = (item: DirectoryArtist) =>
    item.members.some((member) =>
      member.tracks.some((file) =>
        communityAnnotated.has(lakhAnalysisKey(member.name, file)),
      ),
    );
  const annotated = useMemo(
    () => new Set(Object.keys(analyses).filter((key) => !!analyses[key])),
    [analyses],
  );
  const annotatedWithFewSections = useMemo(
    () =>
      new Set(
        Object.keys(analyses).filter(
          (key) => analyses[key] && (analyses[key].sections?.length ?? 0) <= 1,
        ),
      ),
    [analyses],
  );
  const artistHasFewSections = (item: DirectoryArtist) =>
    item.members.some((member) =>
      member.tracks.some((file) =>
        annotatedWithFewSections.has(lakhAnalysisKey(member.name, file)),
      ),
    );
  const annotatedSongs = (item: DirectoryArtist) =>
    countSongs(
      item.members.flatMap((member) =>
        member.tracks.filter((file) =>
          annotated.has(lakhAnalysisKey(member.name, file)),
        ),
      ),
    );
  const trackSources = collectTrackSources(
    artist ? [artist, ...relatedArtists] : [],
  );
  const isAnnotatedTrack = (displayFile: string) => {
    const track = trackSources.get(displayFile);
    return (
      !!track && annotated.has(lakhAnalysisKey(track.source.name, track.file))
    );
  };
  const tracks = Array.from(trackSources.keys());
  const renderTrackEntry = (
    trackSources: ReturnType<typeof collectTrackSources>,
    file: string,
    label?: string,
    query = "",
  ) => {
    const original = trackSources.get(file)!;
    const analysisKey = lakhAnalysisKey(original.source.name, original.file);
    const hasAnalysis = annotated.has(analysisKey);
    return (
      <Entry
        to={lakhTrackUrl(original.source, original.file)}
        $folder={false}
        $annotated={hasAnalysis}
        $community={communityAnnotated.has(analysisKey)}
        $hasFewSections={annotatedWithFewSections.has(analysisKey)}
        $version={label !== undefined && /^\d+$/.test(label)}
        title={`${file}${hasAnalysis ? " · Annotated" : ""}`}
        aria-label={`${file.replace(/\.mid$/i, "")}${
          hasAnalysis ? " · Annotated" : ""
        }`}
      >
        {highlightMatches(label || file.replace(/\.mid$/i, ""), query)}
      </Entry>
    );
  };
  const renderArtist = (item: DirectoryArtist) => {
    const count = annotatedSongs(item);
    const songCount = artistSongCounts.get(item.name)!;
    const tags = artistProfile(item.name).tags;
    const singleSongVersions =
      songCount === 1
        ? item.members.flatMap((source) =>
            source.tracks.map((file) => ({ source, file })),
          )
        : [];
    const directTrack =
      singleSongVersions.find(({ source, file }) =>
        annotated.has(lakhAnalysisKey(source.name, file)),
      ) ||
      singleSongVersions.find(({ file }) => !/\.\d+\.mid$/i.test(file)) ||
      singleSongVersions[0];
    return (
      <li key={item.name}>
        <Entry
          to={
            directTrack
              ? lakhTrackUrl(directTrack.source, directTrack.file)
              : lakhArtistUrl(item)
          }
          $folder
          $annotated={count > 0}
          $community={artistHasCommunity(item)}
          $hasFewSections={artistHasFewSections(item)}
          $hasAlbums={item.members.some(
            (member) => member.name === "The Beatles" || albumArtistSlugs.has(member.slug),
          )}
          title={`${songCount} ${
            songCount === 1 ? "song" : "songs"
          } · ${count} annotated${tags.length ? ` · ${tags.join(" · ")}` : ""}`}
        >
          {highlightMatches(item.name, search)}
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
          <DirectorySearch
            type="search"
            autoFocus
            aria-label="Search artists and songs"
            placeholder="Search artists and songs"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        )}
      </Heading>
      {!artist && search && (
        <SearchPanes>
          <section aria-labelledby="lakh-artist-search-heading">
            <h2 id="lakh-artist-search-heading">Artists</h2>
            {visibleArtists.length ? (
              <SearchResults>{visibleArtists.map(renderArtist)}</SearchResults>
            ) : (
              <p role="status">–</p>
            )}
          </section>
          <section aria-labelledby="lakh-song-search-heading">
            <h2 id="lakh-song-search-heading">Songs</h2>
            {matchingSongs.size ? (
              <SearchResults>
                {Array.from(
                  matchingSongs,
                  ([artistName, { artist: resultArtist, tracks }]) => (
                    <li key={artistName}>
                      <Entry
                        to={lakhArtistUrl(resultArtist)}
                        $folder
                        $annotated={annotatedSongs(resultArtist) > 0}
                        $community={artistHasCommunity(resultArtist)}
                        $hasFewSections={artistHasFewSections(resultArtist)}
                      >
                        {artistName}
                      </Entry>
                      <BeatlesDiscography
                        groupByAlbum={false}
                        files={Array.from(tracks.keys())}
                        allFiles={Array.from(tracks.keys())}
                        isAnnotated={(file) => {
                          const original = tracks.get(file)!;
                          return annotated.has(
                            lakhAnalysisKey(
                              original.source.name,
                              original.file,
                            ),
                          );
                        }}
                        renderTitle={(title) => highlightMatches(title, search)}
                        renderTrack={(file, label) =>
                          renderTrackEntry(tracks, file, label, search)
                        }
                      />
                    </li>
                  ),
                )}
              </SearchResults>
            ) : (
              <p role="status">No matching songs.</p>
            )}
          </section>
        </SearchPanes>
      )}
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
            renderTrack={(file, label) =>
              renderTrackEntry(trackSources, file, label)
            }
          />
        </>
      ) : !search ? (
        <ArtistTable
          artists={visibleArtists}
          renderArtist={renderArtist}
          songCount={(item) => artistSongCounts.get(item.name) || 0}
          hasAnnotations={(item) => annotatedSongs(item) > 0}
        />
      ) : null}
      {artist && tracks.length === 0 && <p>No tracks.</p>}
      <Attribution>
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
