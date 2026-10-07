import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { findProgression, parseProgression } from "../../../harmony/harmony";
import { HarmonyIndex, loadHarmonyIndex } from "../../../harmony/index";
import { canonicalArtistName } from "../../lakh/artistShelves";
import { AppContext } from "../../AppContext";
import LakhEntry from "../../lakh/LakhEntry";
import {
  LAKH_ANNOTATION_COLORS,
  manualLakhAnnotation,
} from "../../lakh/annotationStatus";
import {
  LakhCatalog,
  lakhAnalysisKey,
  loadLakhCatalog,
  resolveLakhRoute,
} from "../../lakh/catalog";
const Page = styled.main`
  padding: 28px clamp(16px, 4vw, 64px) 80px;
  color: #eee;
  background: #080808;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
  h1 {
    font-size: 28px;
    font-weight: 500;
    margin: 0 0 10px;
  }
  p {
    color: #aaa;
    line-height: 1.5;
    max-width: 800px;
  }
  a {
    color: #d8c6ff;
  }
  form {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin: 24px 0 12px;
  }
  input[type="text"] {
    flex: 1;
    min-width: 200px;
    max-width: 480px;
    padding: 12px 14px;
    background: #18151e;
    color: white;
    border: 1px solid #8c75b1;
    border-radius: 6px;
    font-size: 20px;
  }
  button,
  select {
    background: #24202c;
    color: #eee;
    border: 1px solid #655673;
    border-radius: 5px;
    padding: 9px 12px;
    cursor: pointer;
  }
  button:hover {
    background: #372d46;
  }
  button[aria-pressed="true"] {
    border-color: #c1a4ef;
  }
  label {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    color: #aaa;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    max-width: 1100px;
    margin-top: 22px;
  }
  td,
  th {
    padding: 12px 10px;
    border-bottom: 1px solid #28232f;
    text-align: left;
  }
  th {
    font-size: 12px;
    color: #888;
    font-weight: normal;
  }
  td small {
    display: block;
    color: #888;
    margin-top: 5px;
  }
  td:first-child {
    width: 45%;
  }
  @media (max-width: 600px) {
    td,
    th {
      padding: 10px 5px;
      font-size: 12px;
    }
    td:first-child {
      width: auto;
    }
  }
`;
const EXAMPLES = [
  "IV bVII I",
  "I bVII IV I",
  "I V vi IV",
  "ii V7 I",
  "i bVI bVII i",
];
export default function HarmonicSearch() {
  const context = useContext(AppContext);
  const location = useLocation(),
    history = useHistory();
  const initial = new URLSearchParams(location.search).get("q") || EXAMPLES[0];
  const [query, setQuery] = useState(initial),
    [active, setActive] = useState(initial);
  const [index, setIndex] = useState<HarmonyIndex | null>(null),
    [error, setError] = useState("");
  const [catalog, setCatalog] = useState<LakhCatalog | null>(null);
  const [threshold, setThreshold] = useState("0.6"),
    [families, setFamilies] = useState(true),
    [versions, setVersions] = useState(false),
    [limit, setLimit] = useState(50);
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadHarmonyIndex(), loadLakhCatalog()])
      .then(([data, catalog]) => {
        if (!cancelled) {
          setCatalog(catalog);
          setIndex(data);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const value = new URLSearchParams(location.search).get("q") || EXAMPLES[0];
    setActive(value);
    setQuery(value);
    setLimit(50);
  }, [location.search]);
  const results = useMemo(() => {
    let parsed;
    try {
      parsed = parseProgression(active);
    } catch (e) {
      return { error: e.message, rows: [], count: 0 };
    }
    const rows = (index?.tracks || [])
      .flatMap((track) => {
        const matches = findProgression(
          track.sequence,
          track.certainty,
          parsed,
          Number(threshold),
          families,
        );
        if (!matches.length) return [];
        const best = matches.reduce((a, b) =>
          a.confidence >= b.confidence ? a : b,
        );
        return [
          {
            track,
            ...best,
            length: parsed.length,
            occurrences: matches.length,
          },
        ];
      })
      .sort(
        (a, b) =>
          b.confidence - a.confidence ||
          a.track.artist.localeCompare(b.track.artist) ||
          a.track.title.localeCompare(b.track.title),
      );
    const unique = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      const song = `${canonicalArtistName(
        row.track.artist,
      )}/${row.track.title.replace(/\.\d+$/, "")}`
        .toLowerCase()
        .replace(/[^a-z0-9/]/g, "");
      if (!unique.has(song)) unique.set(song, row);
    }
    return {
      error: "",
      rows: versions ? rows : [...unique.values()],
      count: rows.length,
    };
  }, [active, index, threshold, families, versions]);
  const submit = (value: string) => {
    history.replace({
      pathname: location.pathname,
      search: `?q=${encodeURIComponent(value)}`,
    });
    setActive(value);
    setQuery(value);
    setLimit(50);
  };
  return (
    <Page>
      <h1>Harmonic search</h1>
      <p>
        Find chord progressions across Lakh, in any key. Matches follow
        consecutive harmonies and stay within one tonic region. Open a result to
        see the chords over its MIDI score.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
      >
        <input
          type="text"
          aria-label="Chord progression"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="IV bVII I"
        />
        <button type="submit">Find progression</button>
        <label>
          Evidence{" "}
          <select
            aria-label="Minimum harmonic evidence"
            value={threshold}
            onChange={(e) => {
              setThreshold(e.target.value);
              setLimit(50);
            }}
          >
            <option value="0.6">Conservative ≥ 0.60</option>
            <option value="0.45">Exploratory ≥ 0.45</option>
            <option value="0">All estimates</option>
          </select>
        </label>
      </form>
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        {EXAMPLES.map((example) => (
          <button
            key={example}
            aria-pressed={active === example}
            onClick={() => submit(example)}
          >
            {example.replace(/b/g, "♭")}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
        <label>
          <input
            type="checkbox"
            checked={families}
            onChange={(e) => setFamilies(e.target.checked)}
          />
          Group triads and sevenths; explicit V7 stays exact
        </label>
        <label>
          <input
            type="checkbox"
            checked={versions}
            onChange={(e) => setVersions(e.target.checked)}
          />
          Show every MIDI arrangement
        </label>
      </div>
      <p style={{ fontSize: 12 }}>
        Evidence is the weaker of chord and tonic support, not a measured
        probability. Power chords keep their missing-third uncertainty.{" "}
        <Link to="/discover/chromatic-minor-bass">Chromatic bass search</Link>
      </p>
      <div
        aria-label="Manual annotation colors"
        style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 12 }}
      >
        <span style={{ color: LAKH_ANNOTATION_COLORS.manual }}>
          Manual annotation
        </span>
        <span style={{ color: LAKH_ANNOTATION_COLORS.fewSections }}>
          Manual annotation · ≤1 section
        </span>
        <span style={{ color: LAKH_ANNOTATION_COLORS.unannotated }}>
          No manual annotation
        </span>
      </div>
      {error && <p role="alert">{error}</p>}
      {!error && !index && <p role="status">Loading the harmonic index…</p>}
      {results.error && <p role="alert">{results.error}</p>}
      {index && !results.error && (
        <>
          <p role="status" style={{ fontSize: 13 }}>
            {results.rows.length.toLocaleString()}{" "}
            {versions ? "arrangements" : "songs"} ·{" "}
            {results.count.toLocaleString()} matching arrangements ·{" "}
            {index.indexed.toLocaleString()} indexed /{" "}
            {index.attempted.toLocaleString()} files
            {index.skipped
              ? ` · ${index.skipped} unreadable or unsupported`
              : ""}
          </p>
          {!results.rows.length ? (
            <p>
              No matches at this evidence threshold. Try exploratory mode or
              another progression.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Song</th>
                  <th>Measures</th>
                  <th>Evidence</th>
                  <th>Occurrences</th>
                </tr>
              </thead>
              <tbody>
                {results.rows.slice(0, limit).map((row) => {
                  const source = resolveLakhRoute(catalog, row.track.url);
                  const annotation = manualLakhAnnotation(
                    context?.annotationVersions || {},
                    source.artist && source.track
                      ? lakhAnalysisKey(source.artist.name, source.track)
                      : "",
                  );
                  return (
                    <tr
                      key={row.track.url}
                      data-manual-annotation={annotation.annotated}
                    >
                      <td>
                        <LakhEntry
                          $folder={false}
                          $annotated={annotation.annotated}
                          $hasFewSections={annotation.hasFewSections}
                          title={annotation.label}
                          to={`${row.track.url}?harmony=1&measure=${Math.floor(
                            row.track.starts[row.index],
                          )}`}
                        >
                          {canonicalArtistName(row.track.artist)} —{" "}
                          {row.track.title}
                        </LakhEntry>
                        <small>
                          <span style={{ color: annotation.color }}>
                            {annotation.label}
                          </span>{" "}
                          ·{" "}
                          {row.track.keySource === "saved"
                            ? "Saved tonic · estimated chords"
                            : "Estimated tonic and chords"}
                        </small>
                      </td>
                      <td>
                        {row.track.starts[row.index]}–
                        {row.track.ends[row.endIndex]}
                      </td>
                      <td>{row.confidence.toFixed(2)}</td>
                      <td>{row.occurrences}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {results.rows.length > limit && (
            <button
              style={{ marginTop: 18 }}
              onClick={() => setLimit(limit + 50)}
            >
              Show 50 more
            </button>
          )}
        </>
      )}
    </Page>
  );
}
