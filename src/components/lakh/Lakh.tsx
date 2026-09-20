import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import { Analysis } from "../rawl/analysis";
import Rawl from "../rawl/Rawl";
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
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
  color: #ddd;
  input {
    background: #181818;
    color: white;
    border: 1px solid #666;
    padding: 10px;
    width: min(420px, 90%);
    margin: 12px 0;
  }
  nav {
    margin-bottom: 18px;
  }
`;
const Entries = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 8px;
`;
const Entry = styled(Link)<{ $annotated: boolean; $folder: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  height: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  border-left: 3px solid
    ${({ $annotated, $folder }) =>
      !$annotated ? "#444" : $folder ? "#dcb869" : "#6acbb5"};
  background: ${({ $annotated, $folder }) =>
    !$annotated ? "#191919" : $folder ? "#30291b" : "#16332d"};
  color: ${({ $annotated, $folder }) =>
    !$annotated ? "#ddd" : $folder ? "#f2d18d" : "#8ee8d0"};
  text-decoration: none;
  &:hover,
  &:focus {
    outline: 1px solid currentColor;
    text-decoration: none;
  }
  small {
    color: #aaa;
  }
`;

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
  const trackName = track?.replace(/\.mid$/i, "") || trackSegment;
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
        <nav>
          <Link to="/lakh/">Lakh</Link>
          {artistName && (
            <>
              {" "}
              /{" "}
              {artist ? (
                <Link to={lakhArtistUrl(artist)}>{artistName}</Link>
              ) : (
                artistName
              )}
            </>
          )}
          {track && <> / {track.replace(/\.mid$/i, "")}</>}
        </nav>
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
  const [query, setQuery] = useState("");
  const [annotatedOnly, setAnnotatedOnly] = useState(false);
  const annotated = useMemo(
    () => new Set(Object.keys(analyses).filter((key) => !!analyses[key])),
    [analyses],
  );
  const search = query.trim().toLocaleLowerCase();
  const counts = (name: string, tracks: string[]) =>
    tracks.filter((file) => annotated.has(lakhAnalysisKey(name, file))).length;
  const visibleArtists =
    catalog?.artists.filter(
      (item) =>
        (!annotatedOnly || counts(item.name, item.tracks) > 0) &&
        (item.name.toLocaleLowerCase().includes(search) ||
          item.tracks.some((file) =>
            file.toLocaleLowerCase().includes(search),
          )),
    ) || [];
  const visibleTracks =
    artist?.tracks.filter(
      (file) =>
        (!annotatedOnly || annotated.has(lakhAnalysisKey(artistName, file))) &&
        file.toLocaleLowerCase().includes(search),
    ) || [];

  return (
    <>
      <h1>{artistName || "Lakh"}</h1>
      <p>
        {artist
          ? `${artist.tracks.length.toLocaleString()} tracks · ${counts(
              artist.name,
              artist.tracks,
            )} annotated`
          : `${catalog.artists.length.toLocaleString()} artists · ${catalog.trackCount.toLocaleString()} tracks`}
      </p>
      <p>
        Gold folders contain annotated tracks. Green tracks have an analysis.
      </p>
      <input
        aria-label={artist ? "Search tracks" : "Search artists or tracks"}
        placeholder={artist ? "Search tracks" : "Search artists or tracks"}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <label style={{ display: "block" }}>
        <input
          type="checkbox"
          style={{ width: "auto", marginRight: 8 }}
          checked={annotatedOnly}
          onChange={(event) => setAnnotatedOnly(event.target.checked)}
        />
        Annotated only
      </label>
      <Entries>
        {artist
          ? visibleTracks.map((file) => {
              const hasAnalysis = annotated.has(
                lakhAnalysisKey(artistName, file),
              );
              return (
                <li key={file}>
                  <Entry
                    to={lakhTrackUrl(artist, file)}
                    $folder={false}
                    $annotated={hasAnalysis}
                  >
                    {file.replace(/\.mid$/i, "")}
                    <small>
                      {hasAnalysis ? "Annotated" : "No analysis yet"}
                    </small>
                  </Entry>
                </li>
              );
            })
          : visibleArtists.map((item) => {
              const count = counts(item.name, item.tracks);
              return (
                <li key={item.name}>
                  <Entry
                    to={lakhArtistUrl(item)}
                    $folder
                    $annotated={count > 0}
                  >
                    {item.name}
                    <small>
                      {item.tracks.length} tracks · {count} annotated
                    </small>
                  </Entry>
                </li>
              );
            })}
      </Entries>
      {(artist ? visibleTracks : visibleArtists).length === 0 && (
        <p>No matches.</p>
      )}
      <p style={{ color: "#aaa", marginTop: 32 }}>
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
