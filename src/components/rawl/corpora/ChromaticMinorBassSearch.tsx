import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import results from "../../../corpus/chromaticMinorBassTop100.json";
import { AppContext } from "../../AppContext";
import InlineRawlPlayer from "../InlineRawlPlayer";
import { Snippet } from "../analysis";
import SnippetItem, { PX_IN_MEASURE } from "../SnippetItem";

type Candidate = (typeof results.candidates)[number];
type TaggedSnippet = (typeof results.taggedSnippets)[number];
type DynamicTagged = Omit<Candidate, "snippet"> & { snippet: Snippet; status: "pass" };
type ResultItem = Candidate | TaggedSnippet | DynamicTagged;
type Filter = "all" | "new" | "tagged" | "pass" | "fail" | "unscanned";

const Page = styled.main<{ $playing: boolean }>`
  height: ${({ $playing }) => ($playing ? "calc(50vh - 30px)" : "calc(100vh - 30px)")};
  box-sizing: border-box;
  overflow-y: auto;
  padding: 20px clamp(14px, 3vw, 48px) 70px;
  background: #080808;
  color: white;
`;

const Intro = styled.div`
  max-width: 920px;
  margin-bottom: 24px;
  h1 { margin: 0 0 8px; font-size: clamp(22px, 2.2vw, 32px); }
  p { margin: 6px 0; color: #bbb; line-height: 1.45; }
  a { color: #ddd; }
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 48px;
`;

const Card = styled.article<{ $saved: boolean }>`
  box-sizing: border-box;
  max-width: 100%;
  outline: ${({ $saved }) => $saved ? "1px solid #4b9b63" : "none"};
  outline-offset: 8px;
  border-radius: 2px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 7px;
  a { color: #fff; text-decoration: none; overflow-wrap: anywhere; }
  a:hover { text-decoration: underline; }
`;

const Rank = styled.span`
  flex: 0 0 auto;
  color: #aaa;
  font-variant-numeric: tabular-nums;
`;

const SaveButton = styled.button`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #777;
  border-radius: 4px;
  background: #222;
  color: white;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease, background 120ms ease;
  ${Card}:hover &, ${Card}:focus-within &, &:focus-visible {
    opacity: 1;
    pointer-events: auto;
  }
  @media (hover: none) {
    opacity: 1;
    pointer-events: auto;
  }
  &:hover:enabled { background: #333; }
  &:disabled { color: #aaa; cursor: default; }
  svg { width: 18px; height: 18px; }
`;

const SaveIcon: React.FC<{ saved: boolean }> = ({ saved }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
    {saved ? <path d="m9 10 2 2 4-4" /> : <><path d="M12 7v6" /><path d="M15 10H9" /></>}
  </svg>
);

const Badge = styled.span<{ $status: string }>`
  display: inline-block;
  margin-left: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $status }) => $status === "pass" ? "#244c36" : $status === "fail" ? "#55302f" : "#51452c"};
  color: #fff;
  font-size: 11px;
  white-space: nowrap;
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 16px 0 8px;
  button {
    padding: 5px 9px;
    border: 1px solid #555;
    border-radius: 5px;
    background: #1a1a1a;
    color: #ddd;
    cursor: pointer;
  }
  button[aria-pressed="true"] { background: #eee; border-color: #eee; color: #111; }
`;

const Details = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px 12px;
  margin-bottom: 9px;
  color: #bbb;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
`;

const PreviewButton = styled.button`
  display: block;
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: auto;
  padding: 0;
  border: 0;
  background: black;
  cursor: pointer;
  text-align: left;
  &:focus-visible { outline: 2px solid #bbb; }
  &:disabled { cursor: default; }
`;

const ChromaticMinorBassSearch: React.FC = () => {
  const app = useContext(AppContext);
  const [selected, setSelected] = useState<ResultItem | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Filter>("all");
  if (!app) return null;
  const { currentMidi, rawlProps, handleSongClick, eject, analyses, loadingUser, saveSnippetForKey } = app;
  const playing = !!selected && !!currentMidi && !!rawlProps?.parsingResult;

  const openCandidate = async (candidate: ResultItem) => {
    setLoading(candidate.slug);
    try {
      if (currentMidi && currentMidi.slug !== candidate.slug) eject();
      await handleSongClick(candidate.slug);
      setSelected(candidate);
    } finally {
      setLoading(null);
    }
  };

  const saveCandidate = async (candidate: ResultItem) => {
    const id = `${candidate.slug}:${candidate.from}-${candidate.to}`;
    setSaving(id);
    setSaveErrors((previous) => ({ ...previous, [id]: "" }));
    try {
      await saveSnippetForKey(`f/${candidate.slug}`, {
        ...(candidate.snippet as unknown as Snippet),
        tag: "bass:chromatic_line_down_from_minor_i",
      });
    } catch (error) {
      console.error("Could not save search result as a snippet", error);
      setSaveErrors((previous) => ({ ...previous, [id]: "Could not save snippet. Try again." }));
    } finally {
      setSaving(null);
    }
  };

  const newCandidates: Candidate[] = [];
  const dynamicallyTagged: DynamicTagged[] = [];
  for (const candidate of results.candidates) {
    const savedSnippets = (analyses[`f/${candidate.slug}`]?.snippets || []).filter((snippet) =>
      snippet.tag === "bass:chromatic_line_down_from_minor_i");
    if (!savedSnippets.length) {
      newCandidates.push(candidate);
      continue;
    }
    const saved = savedSnippets.find((snippet) =>
      snippet.measuresSpan[0] === candidate.from && snippet.measuresSpan[1] === candidate.to);
    if (saved) dynamicallyTagged.push({ ...candidate, snippet: saved, status: "pass" });
  }
  const taggedResults = [...results.taggedSnippets, ...dynamicallyTagged];
  const allResults: ResultItem[] = [...newCandidates, ...taggedResults]
    .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity) ||
      a.slug.localeCompare(b.slug) || a.from - b.from);
  const visibleResults = allResults.filter((candidate) => {
    const status = "status" in candidate ? candidate.status : "new";
    return filter === "all" || filter === "tagged" && status !== "new" ||
      filter === status;
  });
  const counts = {
    all: allResults.length,
    new: newCandidates.length,
    tagged: taggedResults.length,
    pass: taggedResults.filter((item) => item.status === "pass").length,
    fail: taggedResults.filter((item) => item.status === "fail").length,
    unscanned: taggedResults.filter((item) => item.status === "unscanned").length,
  };

  return (
    <>
      <Page $playing={playing}>
        <Intro>
          <h1>Chromatic bass from minor i · search results</h1>
          <p>Up to 100 new MIDI candidates from pieces without a saved example, plus your tagged snippets. Bass notes must onset on strong beats and change at an even pace, allowing occasional doubled gaps. A sustained major third cannot dominate the opening or lead into the descent. Rank is the position among all detected passages, including tagged passages; filtering keeps that rank.</p>
          <p>Click a snippet to open that passage in Rawl. {results.scanned.toLocaleString()} local MIDI files were scanned. <Link to="/s/bass/chromatic_line_down_from_minor_i">View tagged examples</Link>.</p>
          <Filters aria-label="Filter bass search results">
            {(["all", "new", "tagged", "pass", "fail", "unscanned"] as Filter[]).map((choice) => (
              <button key={choice} type="button" aria-pressed={filter === choice}
                onClick={() => setFilter(choice)}>
                {{ all: "All", new: "New", tagged: "My snippets", pass: "Pass", fail: "Fail", unscanned: "Not scanned" }[choice]} ({counts[choice]})
              </button>
            ))}
          </Filters>
          <p>Pass means the detector found a passage overlapping at least two measures of your snippet. Fail means it found none. Unranked snippets did not pass; “Not scanned” has no indexed MIDI.</p>
        </Intro>
        <Grid>
          {visibleResults.map((candidate, index) => {
            const id = `${candidate.slug}:${candidate.from}-${candidate.to}`;
            const saved = (analyses[`f/${candidate.slug}`]?.snippets || []).some((snippet) =>
              snippet.tag === "bass:chromatic_line_down_from_minor_i" &&
              snippet.measuresSpan[0] === candidate.from &&
              snippet.measuresSpan[1] === candidate.to);
            return (
            <Card key={`${"status" in candidate ? "tagged" : "new"}:${candidate.slug}:${candidate.from}`}
              $saved={saved || "status" in candidate}
              style={{ width: Math.max(320, (candidate.to - candidate.from + 1) * PX_IN_MEASURE) }}>
              <CardHeader>
                <div><Rank>{candidate.rank == null ? "Unranked" : `#${candidate.rank}`} </Rank>
                  <Link to={`/f/${candidate.slug}`}>{candidate.title || candidate.slug}</Link>
                  {"status" in candidate && <Badge $status={candidate.status}>
                    {candidate.status === "pass" ? "MY SNIPPET · PASS" : candidate.status === "fail" ? "MY SNIPPET · FAIL" : "MY SNIPPET · NOT SCANNED"}
                  </Badge>}
                </div>
                <SaveButton type="button" disabled={loadingUser || (saved && !saveErrors[id]) || saving === id}
                  onClick={() => void saveCandidate(candidate)}
                  title={loadingUser ? "Loading snippets…" : saving === id ? "Saving snippet…" : saveErrors[id] ? "Retry saving snippet" : saved ? "Saved snippet" : "Save snippet"}
                  aria-label={`${saveErrors[id] ? "Retry saving snippet" : saved ? "Saved snippet" : "Save snippet"} for ${candidate.title || candidate.slug}, measures ${candidate.from}–${candidate.to}`}>
                  <SaveIcon saved={saved && !saveErrors[id]} />
                </SaveButton>
              </CardHeader>
              {saveErrors[id] && <Details role="alert">{saveErrors[id]}</Details>}
              <Details>
                {candidate.bassNotes != null && <span>{candidate.bassNotes} bass notes</span>}
                {candidate.harmonicPulseBeats != null && <span>every {Number(candidate.harmonicPulseBeats.toFixed(2))} beat{Math.abs(candidate.harmonicPulseBeats - 1) < 0.01 ? "" : "s"}</span>}
                {candidate.doubledGaps != null && candidate.doubledGaps > 0 && <span>{candidate.doubledGaps} doubled gap{candidate.doubledGaps === 1 ? "" : "s"}</span>}
                {candidate.minorSupport != null && <span>minor chord: {candidate.minorSupport}/2</span>}
                {candidate.skipped != null && candidate.skipped > 0 && <span>{candidate.skipped} skipped steps</span>}
              </Details>
              <PreviewButton type="button" onClick={() => void openCandidate(candidate)}
                disabled={"status" in candidate && candidate.status === "unscanned"}
                aria-label={`Open ${candidate.title || candidate.slug} at measure ${candidate.from}`}>
                <SnippetItem snippet={candidate.snippet as unknown as Snippet} index={index}
                  emphasizedNotes={candidate.bassTriggers as [number, number][]}
                  noteHeight={3} isPreview={true} />
              </PreviewButton>
              {loading === candidate.slug && <Details>Loading piece…</Details>}
            </Card>
          ); })}
        </Grid>
      </Page>
      {playing && selected && (
        <InlineRawlPlayer measureStart={selected.from} onEject={() => setSelected(null)} />
      )}
    </>
  );
};

export default ChromaticMinorBassSearch;
