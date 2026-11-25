import React, { useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fakebookScorePath,
  fakebookSettings as settings,
  fakebookUrl,
} from "./fakebookScores";
import snapshot from "./corpus.json";
import copy from "./copy.json";
import HoroExcerpt from "./HoroExcerpt";
import { getCatalogGrouping } from "./horoGrouping";
import "./horoAnalysis.css";

type Region = {
  measure: number;
  endMeasure: number;
  tonic: string;
  pitchClass: number;
  scale: string;
  core: string[];
  candidates: string[];
};

type ModeChange = {
  measure: number;
  tonic: string;
  previous: { scale: string };
  current: { scale: string };
  kind: string;
  removed: { note: string }[];
  added: { note: string }[];
};

type Rendition = {
  slug: string;
  title: string;
  meter: string;
  measures: number;
  tonicSource: string;
  opening: Region;
  regions: Region[];
  sections: number[];
  modeChanges?: ModeChange[];
};

type Group = {
  id: string;
  title: string;
  preferred: string;
  members: string[];
  kind: string;
  preferredReason?: string;
};

const { entries, groups, excerpts, summary, related } = snapshot;
const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
const preferred = (group: Group): Rendition => bySlug.get(group.preferred)!;
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
const color = (region: Region) =>
  region.pitchClass >= 0
    ? `hsl(${region.pitchClass * 30 + 12} 43% 66%)`
    : "#77736b";

function tally(values: string[]) {
  const totals = new Map<string, number>();
  values.forEach((value) => totals.set(value, 1 + (totals.get(value) ?? 0)));
  return [...totals].sort(([a, x], [b, y]) => y - x || a.localeCompare(b));
}

function Distribution({
  title,
  data,
  selected,
  select,
}: {
  title: string;
  data: [string, number][];
  selected: string;
  select?: (label: string) => void;
}) {
  const row = ([label, count]: [string, number]) => {
    const cells = (
      <>
        <span>{label}</span>
        <span className="horo-count-track" aria-hidden="true">
          <span style={{ width: `${(count / data[0][1]) * 100}%` }} />
        </span>
        <span>{count}</span>
      </>
    );
    return (
      <li key={label}>
        {select ? (
          <button
            type="button"
            aria-pressed={selected === label}
            onClick={() => select(selected === label ? "" : label)}
          >
            {cells}
          </button>
        ) : (
          <div className="horo-count-row">{cells}</div>
        )}
      </li>
    );
  };
  return (
    <div className="horo-distribution">
      <h3>{title}</h3>
      <ul>{data.slice(0, 8).map(row)}</ul>
      {data.length > 8 && (
        <details>
          <summary>More · {data.length - 8}</summary>
          <ul>{data.slice(8).map(row)}</ul>
        </details>
      )}
    </div>
  );
}

function TonalPath({ rendition }: { rendition: Rendition }) {
  return (
    <div className="horo-path">
      <div className="horo-ribbon" aria-hidden="true">
        {rendition.regions.map((region) => (
          <span
            key={region.measure}
            style={{
              flexGrow: region.endMeasure - region.measure + 1,
              background: color(region),
            }}
          />
        ))}
      </div>
      <ol>
        {rendition.regions.map((region) => (
          <li key={region.measure}>
            <span
              className="horo-path-dot"
              aria-hidden="true"
              style={{ background: color(region) }}
            />
            <strong>
              {region.tonic} · {region.scale}
            </strong>
            <span className="horo-secondary">m. {region.measure}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RenditionDetails({ rendition }: { rendition: Rendition }) {
  const {
    meter,
    measures,
    opening,
    regions,
    sections,
    tonicSource,
    modeChanges,
  } = rendition;
  const grouping = getCatalogGrouping(rendition.slug);
  return (
    <dl className="horo-evidence">
      <div>
        <dt>Meter</dt>
        <dd>{meter}</dd>
      </div>
      <div>
        <dt>Measures</dt>
        <dd>{measures}</dd>
      </div>
      {grouping && (
        <div className="horo-degree-row">
          <dt>Grouping</dt>
          <dd>
            {Object.entries(grouping).map(([measure, groups]) => (
              <span key={measure}>
                m. {measure} · {groups.join("+") || "—"}
              </span>
            ))}
          </dd>
        </div>
      )}
      {sections.length > 1 && (
        <div>
          <dt>Sections</dt>
          <dd>{sections.join(", ")}</dd>
        </div>
      )}
      <div>
        <dt>Tonic source</dt>
        <dd>{tonicSource}</dd>
      </div>
      <div className="horo-degree-row">
        <dt>Opening scale</dt>
        <dd>
          {opening.tonic} · {opening.scale} · {opening.core.join(" ") || "?"}
        </dd>
      </div>
      {opening.candidates.length > 1 && (
        <div>
          <dt>Scale candidates</dt>
          <dd>{opening.candidates.join(" / ")}</dd>
        </div>
      )}
      <div className="horo-degree-row">
        <dt>Scale degrees</dt>
        <dd>
          {regions.map((region) => (
            <span key={region.measure}>
              m. {region.measure} · {region.core.join(" ") || "?"}
            </span>
          ))}
        </dd>
      </div>
      {modeChanges?.map(
        ({ measure, tonic, previous, current, kind, removed, added }) => (
          <div className="horo-degree-row" key={measure}>
            <dt>{kind}</dt>
            <dd>
              <span>
                m. {measure} · {tonic} · {previous.scale} → {current.scale}
              </span>
              <span>
                {removed.map(({ note }) => note).join(", ")} →{" "}
                {added.map(({ note }) => note).join(", ")}
              </span>
            </dd>
          </div>
        ),
      )}
    </dl>
  );
}

const repertoire = groups.filter((group) => group.kind !== "Comparison");
const openingScales = tally(
  repertoire.map((group) => preferred(group).opening.scale),
);
const openingMeters = tally(repertoire.map((group) => preferred(group).meter));
const recordedSettings = settings.filter((setting) => !!setting.slug).length;

export default function HoroAnalysis() {
  const [query, setQuery] = useState("");
  const [scale, setScale] = useState("");
  const [meter, setMeter] = useState("");
  const [motion, setMotion] = useState("");
  const [bookQuery, setBookQuery] = useState("");

  useLayoutEffect(() => {
    const title = document.title;
    const viewport = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]',
    );
    const originalViewport = viewport?.content;
    document.title = "Horo analysis · Rawl";
    if (viewport) viewport.content = "width=device-width, initial-scale=1";
    return () => {
      document.title = title;
      if (viewport && originalViewport !== undefined)
        viewport.content = originalViewport;
    };
  }, []);

  const search = normalize(query.trim());
  const shown = groups.filter((group) => {
    const reference = preferred(group);
    const changes = reference.regions.length > 1;
    return (
      (!scale || reference.opening.scale === scale) &&
      (!meter || reference.meter === meter) &&
      (!motion ||
        (motion === "modes"
          ? !!reference.modeChanges?.length
          : changes === (motion === "changes"))) &&
      (!search ||
        normalize(group.title).includes(search) ||
        group.members.some((slug) =>
          normalize(`${slug} ${bySlug.get(slug)?.title ?? ""}`).includes(
            search,
          ),
        ))
    );
  });

  const bookSearch = normalize(bookQuery.trim());
  const shownSettings = settings.filter(({ title, titleBg, page, region }) =>
    normalize(`${title} ${titleBg ?? ""} ${page} ${region ?? ""}`).includes(
      bookSearch,
    ),
  );

  return (
    <main className="horo-analysis">
      <div className="horo-wrap">
        <header className="horo-header">
          <Link to="/corpus/horo" className="horo-back">
            ← Horo corpus
          </Link>
          <h1>Horo analysis</h1>
          <dl className="horo-totals">
            <div>
              <dt>Rawl scores</dt>
              <dd>{entries.length}</dd>
            </div>
            <div>
              <dt>Tune groups</dt>
              <dd>{repertoire.length}</dd>
            </div>
            <div>
              <dt>Fakebook settings</dt>
              <dd>{settings.length}</dd>
            </div>
          </dl>
          <nav aria-label="Page sections">
            <a href="#overview">Overview</a>
            <a href="#findings">Findings</a>
            <a href="#renditions">Renditions</a>
            <a href="#fakebook">Fakebook</a>
          </nav>
        </header>

        <section id="overview" className="horo-section">
          <h2>Overview</h2>
          <p className="horo-copy">{copy.overview}</p>
          <div className="horo-overview">
            <Distribution
              title="Opening scales"
              data={openingScales}
              selected={scale}
              select={setScale}
            />
            <Distribution
              title="Meters"
              data={openingMeters}
              selected={meter}
              select={setMeter}
            />
          </div>
          <details className="horo-method">
            <summary>Method</summary>
            {copy.method.map((line) => (
              <p key={line} className="horo-copy">
                {line}
              </p>
            ))}
          </details>
        </section>

        <section id="findings" className="horo-section">
          <h2>Findings</h2>
          <dl className="horo-statistics">
            <div>
              <dt>Tonic changes</dt>
              <dd>
                {summary.annotatedWithChanges}/{summary.annotatedEntries}
              </dd>
            </div>
            <div>
              <dt>Section starts</dt>
              <dd>
                {summary.changesAtSections}/{summary.annotatedChanges}
              </dd>
            </div>
            <div>
              <dt>Named openings</dt>
              <dd>
                {summary.namedOpeningScales}/{summary.repertoireEntries}
              </dd>
            </div>
            <div>
              <dt>Parallel changes</dt>
              <dd>{summary.parallelChanges}</dd>
            </div>
          </dl>
          <div className="horo-motion">
            <div>
              <p className="horo-copy">{copy.findings.phrase}</p>
              <p className="horo-copy">{copy.findings.step}</p>
            </div>
            <Distribution
              title="Tonic motion"
              data={summary.transitionIntervals.map(({ label, count }) => [
                label,
                count,
              ])}
              selected=""
            />
          </div>
          <div className="horo-findings">
            {excerpts.map((excerpt) => {
              const rendition = bySlug.get(excerpt.slug)!;
              const explanation =
                excerpt.slug === "daichovo-horo---viacheslav-semyonov"
                  ? copy.findings.daichovo
                  : excerpt.slug === "bulchenska-rachenitsa"
                  ? copy.findings.bulchenska
                  : undefined;
              return (
                <article key={`${excerpt.slug}-${excerpt.measure}`}>
                  <h3>
                    <a
                      href={`/f/${excerpt.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {rendition.title}
                    </a>
                  </h3>
                  {explanation && <p className="horo-copy">{explanation}</p>}
                  <HoroExcerpt excerpt={excerpt} />
                </article>
              );
            })}
          </div>
          <details className="horo-method">
            <summary>Melody matches</summary>
            <ul className="horo-matches">
              {related.map(({ first, second, kind }) => (
                <li key={`${first}-${second}`}>
                  <a href={`/f/${first}`}>{bySlug.get(first)?.title}</a>
                  <span> ↔ </span>
                  <a href={`/f/${second}`}>{bySlug.get(second)?.title}</a>
                  <small>{kind}</small>
                </li>
              ))}
            </ul>
          </details>
        </section>

        <section id="renditions" className="horo-section">
          <h2>Renditions</h2>
          <div className="horo-filters">
            <label>
              <span>Search</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              <span>Opening scale</span>
              <select
                value={scale}
                onChange={(event) => setScale(event.target.value)}
              >
                <option value="">All scales</option>
                {openingScales.map(([label]) => (
                  <option key={label}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Meter</span>
              <select
                value={meter}
                onChange={(event) => setMeter(event.target.value)}
              >
                <option value="">All meters</option>
                {openingMeters.map(([label]) => (
                  <option key={label}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Tonal path</span>
              <select
                value={motion}
                onChange={(event) => setMotion(event.target.value)}
              >
                <option value="">All paths</option>
                <option value="changes">Tonic changes</option>
                <option value="stable">One tonic</option>
                <option value="modes">Mode changes</option>
              </select>
            </label>
          </div>
          <p className="horo-secondary" aria-live="polite">
            {shown.length} groups
          </p>
          <div className="horo-groups">
            {shown.map((group) => {
              const rendition = preferred(group);
              return (
                <details key={group.id}>
                  <summary>
                    <div className="horo-group-title">
                      <strong>{group.title}</strong>
                      <span>
                        {rendition.meter} · {group.members.length}{" "}
                        {group.members.length === 1 ? "score" : "scores"}
                        {group.kind !== "Title group" && ` · ${group.kind}`}
                      </span>
                    </div>
                    <TonalPath rendition={rendition} />
                  </summary>
                  <div className="horo-group-details">
                    {[
                      group.preferred,
                      ...group.members.filter(
                        (slug) => slug !== group.preferred,
                      ),
                    ].map((slug) => {
                      const member = bySlug.get(slug)!;
                      return (
                        <article key={slug} id={slug}>
                          <h3>
                            <a
                              href={`/f/${slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {member.title}
                            </a>
                            {slug === group.preferred &&
                              group.members.length > 1 && (
                                <small>
                                  {group.preferredReason || "Reference"}
                                </small>
                              )}
                          </h3>
                          {slug !== group.preferred && (
                            <TonalPath rendition={member} />
                          )}
                          <RenditionDetails rendition={member} />
                        </article>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        <section id="fakebook" className="horo-section">
          <h2>Fakebook</h2>
          <p>
            <a href={fakebookScorePath}>Folk Music from Bulgaria</a>
            <span className="horo-secondary">
              {" "}
              · Hans Baken · 2007 · {recordedSettings}/{settings.length} MIDI
            </span>
            {" · "}
            <a href={fakebookUrl}>Source PDF</a>
          </p>
          <label className="horo-book-filter">
            <span>Find setting</span>
            <input
              type="search"
              value={bookQuery}
              onChange={(event) => setBookQuery(event.target.value)}
            />
          </label>
          <p className="horo-secondary" aria-live="polite">
            {shownSettings.length} settings
          </p>
          <div className="horo-table-wrap">
            <table className="horo-book">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Setting</th>
                  <th>Credit</th>
                  <th>MIDI</th>
                </tr>
              </thead>
              <tbody>
                {shownSettings.map((setting) => (
                  <tr key={setting.page}>
                    <td>
                      <a
                        href={`${fakebookScorePath}#page=${setting.page}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {setting.page}
                        {setting.endPage > setting.page &&
                          `–${setting.endPage}`}
                      </a>
                    </td>
                    <th scope="row">
                      {setting.title}
                      {setting.titleBg && (
                        <small lang="bg">{setting.titleBg}</small>
                      )}
                      {setting.meter && (
                        <small>
                          {[setting.meter, setting.sourcePitchCenter]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      )}
                      {setting.rhythmGrouping && (
                        <small>
                          {[
                            ...new Set(
                              Object.values(setting.rhythmGrouping)
                                .filter((groups) => groups.length)
                                .map((groups) => groups.join("+")),
                            ),
                          ].join(" · ")}
                        </small>
                      )}
                    </th>
                    <td>
                      {[setting.source, setting.credit, setting.region]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                    <td>
                      {setting.slug ? (
                        <a
                          href={`/f/${setting.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Play
                        </a>
                      ) : (
                        "—"
                      )}
                      {setting.relatedSlug && (
                        <a
                          className="horo-related"
                          href={`/f/${setting.relatedSlug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Related
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
