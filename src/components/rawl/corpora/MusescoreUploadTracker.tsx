import * as React from "react";
import styled from "styled-components";
import snapshot from "./musescoreRanking.json";
import {
  isKnownVocal,
  representedSlug,
} from "./musescoreTrackerClassification";

const STORAGE_KEY = "rawl:musescore-upload-tracker:v1";
const outcomes = [
  "Needs review",
  "Already represented",
  "Uploaded and added",
  "Duplicate composer",
  "Vocal work",
  "Attribution review",
  "Needs solo piano arrangement",
];
const shortOutcome: Record<string, string> = {
  "Needs review": "Review",
  "Already represented": "In corpus",
  "Uploaded and added": "Uploaded",
  "Duplicate composer": "Duplicate",
  "Vocal work": "Vocal",
  "Attribution review": "Attribution",
  "Needs solo piano arrangement": "Need piano",
};
type Entry = {
  outcome?: string;
  rawl?: string;
  notes?: string;
  resolved?: boolean;
  manualOutcome?: boolean;
};
type Progress = Record<string, Entry>;
const Page = styled.main`
  max-width: 1600px;
  margin: 0 auto 100px;
  padding: 24px;
  a {
    color: #ffaa00;
  }
  p,
  small {
    color: #aaa;
    line-height: 1.5;
  }
  details {
    border: 1px solid #444;
    border-radius: 6px;
    margin: 8px 0;
    padding: 10px 12px;
  }
  summary {
    cursor: pointer;
    line-height: 1.3;
  }
  input,
  select,
  button {
    background: #222;
    color: white;
    border: 1px solid #666;
    border-radius: 4px;
    padding: 9px;
    font: inherit;
  }
  input:not([type="checkbox"]) {
    min-width: 0;
  }
  button {
    cursor: pointer;
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 16px 0;
  }
  .toolbar input {
    flex: 1;
  }
  .page-link {
    margin: 4px 0 8px;
    font-size: 13px;
  }
  .score {
    display: grid;
    grid-template-columns: minmax(200px, 1fr) 130px minmax(140px, 220px) minmax(
        120px,
        200px
      ) 24px;
    align-items: center;
    gap: 8px;
    border-top: 1px solid #444;
    padding: 5px 0;
    font-size: 13px;
  }
  .score-main,
  .rawl-cell {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 6px;
  }
  .score-main a,
  .score-main small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .score-main a {
    min-width: 0;
  }
  .score-main small {
    flex: 0 0 auto;
    max-width: 130px;
    font-size: 12px;
  }
  .score select,
  .score input:not([type="checkbox"]) {
    width: 100%;
    box-sizing: border-box;
    padding: 5px 6px;
    font-size: 13px;
  }
  .rawl-cell input {
    flex: 1;
  }
  .rawl-cell a {
    flex: 0 0 auto;
    font-size: 16px;
  }
  .resolve {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .resolve input {
    margin: 0;
  }
  @media (max-width: 850px) {
    details {
      overflow-x: auto;
    }
    .score {
      min-width: 790px;
    }
  }
  nav {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
`;

// Render only the saved document's links and emphasis, without injecting HTML.
const Inline: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g).map((part, i) => {
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const href = link[2].replace("http://localhost:3000", "");
        return (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer">
            {link[1]}
          </a>
        );
      }
      return part.startsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      );
    })}
  </>
);

function readProgress(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved)
      ? saved
      : {};
  } catch {
    return {};
  }
}

const MusescoreUploadTracker: React.FC = () => {
  const [progress, setProgress] = React.useState<Progress>(readProgress);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("All scores");
  const [showVocal, setShowVocal] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
  const [saveError, setSaveError] = React.useState("");
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setSaveError("");
    } catch {
      setSaveError(
        "Progress could not be saved in this browser. Export a backup before leaving.",
      );
    }
  }, [progress]);
  const update = (key: string, patch: Entry) =>
    setProgress((previous) => ({
      ...previous,
      [key]: {
        ...previous[key],
        ...patch,
        ...("outcome" in patch || "resolved" in patch
          ? { manualOutcome: true }
          : {}),
      },
    }));
  const classified = React.useMemo(
    () =>
      snapshot.scores.map((score) => {
        const slug = representedSlug(score.rank, score.title);
        const vocal = !slug && isKnownVocal(score.title, score.arrangement);
        const automatic: Entry = slug
          ? {
              outcome: "Already represented",
              rawl: `/f/${slug}`,
              resolved: true,
            }
          : vocal
          ? { outcome: "Vocal work", resolved: true }
          : {};
        const saved = progress[score.url] || {};
        const userOutcome =
          saved.manualOutcome ||
          (saved.outcome && saved.outcome !== "Needs review");
        const entry = userOutcome
          ? { ...automatic, ...saved }
          : { ...saved, ...automatic };
        return { score, entry, vocal: vocal || entry.outcome === "Vocal work" };
      }),
    [progress],
  );
  const resolved = snapshot.scores.filter(
    (score, index) => classified[index].entry.resolved,
  ).length;
  const uploaded = classified.filter(
    ({ entry }) => entry.outcome === "Uploaded and added",
  ).length;
  const represented = classified.filter(
    ({ entry }) => entry.outcome === "Already represented" && entry.resolved,
  ).length;
  const vocalCount = classified.filter(({ vocal }) => vocal).length;
  const query = search.trim().toLowerCase();
  const visible = classified.filter(
    ({ score, entry, vocal }) =>
      (showVocal || filter === "Vocal work" || !vocal) &&
      `${score.rank} ${score.title} ${score.arrangement} ${entry.notes || ""}`
        .toLowerCase()
        .includes(query) &&
      (filter === "All scores" ||
        (filter === "Unresolved"
          ? !entry.resolved
          : (entry.outcome || "Needs review") === filter)),
  );
  const completedPages = Array.from({ length: 100 }, (_, i) => i + 1).filter(
    (page) =>
      classified
        .filter(({ score }) => score.page === page)
        .every(({ entry }) => entry.resolved),
  ).length;
  const exportProgress = () => {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { snapshotDate: snapshot.snapshotDate, progress },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "musescore-upload-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Page>
      <h1>MuseScore instrumental upload tracker</h1>
      <p>
        100 ranking pages · 2,000 score links · snapshot from 3 October 2026.
        Rankings and view counts are preserved from the original audit.
      </p>
      <nav>
        <a href="/corpus/musescore_instrumental_top">Instrumental category</a>
        <a href="/corpus/top_100_musescore_composers">Corpus philosophy</a>
        <a href="/corpus/">All Rawl pieces</a>
        <a href="/e/">MIDI editor</a>
      </nav>
      <p aria-live="polite">
        {resolved.toLocaleString()} / 2,000 scores resolved · {completedPages} /
        100 pages complete · {represented} already represented · {uploaded}{" "}
        uploaded and added
      </p>
      <p>
        Confirmed corpus matches and identified vocal works are resolved
        automatically. Vocal works are hidden by default. Your changes are saved
        in this browser; export a backup to keep a copy outside it.
      </p>
      {saveError && <p role="alert">{saveError}</p>}
      <button onClick={exportProgress}>Export progress</button>
      <details>
        <summary>Selection rules, priority tasks and category reviews</summary>
        {snapshot.notes.map((note, index) =>
          note.startsWith("## ") ? (
            <h2 key={index}>{note.slice(3)}</h2>
          ) : note.startsWith("- [ ] ") ? (
            <div className="score" key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={!!progress[`task:${index}`]?.resolved}
                  onChange={(e) =>
                    update(`task:${index}`, { resolved: e.target.checked })
                  }
                />{" "}
                <Inline text={note.slice(6)} />
              </label>
            </div>
          ) : (
            <p key={index}>
              <Inline text={note} />
            </p>
          ),
        )}
      </details>
      <div className="toolbar">
        <input
          type="search"
          aria-label="Search scores"
          placeholder="Search title, rank, instruments or notes"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setExpanded({});
          }}
        />
        <select
          aria-label="Filter scores"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setExpanded({});
          }}
        >
          {["All scores", "Unresolved", ...outcomes].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={showVocal}
            onChange={(e) => setShowVocal(e.target.checked)}
          />{" "}
          Show vocal works ({vocalCount})
        </label>
      </div>
      <p>
        Showing {visible.length.toLocaleString()} of 2,000 scores
        {!showVocal && filter !== "Vocal work"
          ? ` · ${vocalCount} vocal works hidden`
          : ""}
      </p>
      {Array.from({ length: 100 }, (_, i) => i + 1).map((page) => {
        const scores = visible.filter(({ score }) => score.page === page);
        if (!scores.length) return null;
        const count = classified.filter(
          ({ score, entry }) => score.page === page && entry.resolved,
        ).length;
        const isOpen = expanded[page] ?? (!!query || filter !== "All scores");
        return (
          <details key={page} open={isOpen}>
            <summary
              onClick={(e) => {
                e.preventDefault();
                setExpanded((previous) => ({ ...previous, [page]: !isOpen }));
              }}
            >
              Ranking page {page} · scores {(page - 1) * 20 + 1}–{page * 20} ·{" "}
              {count}/20 resolved{count === 20 ? " · Complete" : ""}
            </summary>
            <p className="page-link">
              <a
                href={`https://musescore.com/sheetmusic/non-official?${
                  page > 1 ? `page=${page}&` : ""
                }sort=view_count`}
                target="_blank"
                rel="noopener noreferrer"
              >
                MuseScore page {page} ↗
              </a>
            </p>
            {isOpen &&
              scores.map(({ score, entry }) => {
                return (
                  <article className="score" key={score.url}>
                    <div
                      className="score-main"
                      title={`${score.title} · ${score.views} views · ${score.arrangement}`}
                    >
                      <a
                        href={score.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {score.rank}. {score.title}
                      </a>
                      <small>
                        {score.views} · {score.arrangement}
                      </small>
                    </div>
                    <select
                      aria-label={`Outcome for score ${score.rank}`}
                      value={entry.outcome || "Needs review"}
                      onChange={(e) =>
                        update(score.url, {
                          outcome: e.target.value,
                          resolved:
                            e.target.value === "Needs review"
                              ? false
                              : entry.resolved,
                        })
                      }
                    >
                      {outcomes.map((value) => (
                        <option key={value} value={value}>
                          {shortOutcome[value]}
                        </option>
                      ))}
                    </select>
                    <div className="rawl-cell">
                      <input
                        aria-label={`Rawl link for score ${score.rank}`}
                        placeholder="Rawl link"
                        value={entry.rawl || ""}
                        onChange={(e) =>
                          update(score.url, { rawl: e.target.value })
                        }
                      />
                      {/^(\/f\/|https?:\/\/localhost:3000\/f\/|https:\/\/rawl\.rocks\/f\/)/.test(
                        entry.rawl || "",
                      ) && (
                        <a
                          href={entry.rawl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open Rawl entry for score ${score.rank}`}
                          title="Open Rawl entry"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                    <input
                      aria-label={`Notes for score ${score.rank}`}
                      placeholder="Note"
                      value={entry.notes || ""}
                      onChange={(e) =>
                        update(score.url, { notes: e.target.value })
                      }
                    />
                    <label className="resolve">
                      <input
                        type="checkbox"
                        aria-label={`Resolved score ${score.rank}`}
                        checked={!!entry.resolved}
                        disabled={
                          !entry.outcome || entry.outcome === "Needs review"
                        }
                        onChange={(e) =>
                          update(score.url, { resolved: e.target.checked })
                        }
                      />
                    </label>
                  </article>
                );
              })}
          </details>
        );
      })}
      {!visible.length && <p>No scores match this search and filter.</p>}
    </Page>
  );
};
export default MusescoreUploadTracker;
