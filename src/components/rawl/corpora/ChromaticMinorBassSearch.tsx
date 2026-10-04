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
type LiveTagged = Omit<TaggedSnippet, "snippet" | "status"> & { snippet: Snippet; status: string };
type DynamicTagged = Omit<Candidate, "snippet"> & { snippet: Snippet; status: "pass" | "negative" };
type ResultItem = Candidate | TaggedSnippet | LiveTagged | DynamicTagged;
type Filter = "all" | "new" | "tagged" | "pass" | "fail" | "negative" | "unscanned";
type RankingFactor = Candidate["rankingBreakdown"][number];

const POSITIVE_TAG = "bass:chromatic_line_down_from_minor_i";
const NEGATIVE_TAG = "search_feedback:chromatic_line_down_from_minor_i_negative";
const LABEL_TAGS = [POSITIVE_TAG, NEGATIVE_TAG];
const PITCH_NAMES = ["C", "D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];

const FACTOR_LABELS: Record<string, string> = {
  bassNotesUpToEight: "Bass notes (up to 8)",
  extraBassNotesUpToFour: "Extra bass notes",
  minorSupport: "Opening minor-chord support",
  skippedSteps: "Skipped chromatic steps",
  doubledGaps: "Doubled rhythm gaps",
  chromaticStepRatio: "Chromatic step share",
  logHarmonicPulse: "Harmonic pulse",
  longMinorDescent: "Long descent with full minor support",
  minorThirdAttackShare: "♭3 share across the excerpt",
  openingMinorPlausibility: "Opening i-chord plausibility",
  annotatedKeyDistance: "Detected tonic vs. annotated key",
};

function factorValue({ feature, value }: RankingFactor,
  detectedTonic: number | null, annotatedKey: number | null): string {
  if (value == null) return "No annotated key";
  if (feature === "annotatedKeyDistance") {
    if (detectedTonic == null || annotatedKey == null) return `${value} semitones`;
    return `${PITCH_NAMES[detectedTonic]} → ${PITCH_NAMES[annotatedKey]} · ${value} semitone${value === 1 ? "" : "s"}`;
  }
  if (feature === "chromaticStepRatio" || feature === "minorThirdAttackShare" ||
    feature === "openingMinorPlausibility") {
    return `${Math.round(value * 100)}%`;
  }
  if (feature === "logHarmonicPulse") return `${Number((2 ** value).toFixed(2))} beats`;
  if (feature === "minorSupport") return `${value}/2`;
  return String(Number(value.toFixed(2)));
}

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

const Card = styled.article<{ $label: "positive" | "negative" | null; $infoOpen: boolean }>`
  position: relative;
  z-index: ${({ $infoOpen }) => $infoOpen ? 2 : 0};
  box-sizing: border-box;
  max-width: 100%;
  outline: ${({ $label }) => $label === "positive" ? "1px solid #4b9b63" :
    $label === "negative" ? "1px solid #a95b5b" : "none"};
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

const CardActions = styled.div`
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
`;

const CardActionButton = styled.button`
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

const RankingPanel = styled.div`
  position: absolute;
  z-index: 3;
  top: 37px;
  right: 0;
  box-sizing: border-box;
  width: min(360px, calc(100vw - 40px));
  max-height: min(60vh, 470px);
  overflow-y: auto;
  padding: 13px 15px;
  border: 1px solid #666;
  border-radius: 6px;
  background: #181818;
  box-shadow: 0 8px 24px #000c;
  color: #eee;
  font-size: 12px;
  line-height: 1.4;
  h2 { font-size: 14px; margin: 0 0 6px; }
  p { margin: 5px 0 10px; color: #aaa; }
  small { color: #aaa; }
`;

const FactorRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  padding: 5px 0;
  border-top: 1px solid #343434;
  span:first-child { min-width: 0; }
  small { display: block; }
  strong { font-variant-numeric: tabular-nums; font-weight: 500; }
`;

const SaveIcon: React.FC<{ saved: boolean }> = ({ saved }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" />
    {saved ? <path d="m9 10 2 2 4-4" /> : <><path d="M12 7v6" /><path d="M15 10H9" /></>}
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const NegativeIcon: React.FC<{ saved: boolean }> = ({ saved }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    {saved ? <path d="m8 8 8 8m0-8-8 8" /> : <path d="m5 5 14 14" />}
  </svg>
);

const Badge = styled.span<{ $status: string }>`
  display: inline-block;
  margin-left: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $status }) => $status === "pass" ? "#244c36" :
    $status === "fail" || $status === "negative" ? "#55302f" : "#51452c"};
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
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);
  if (!app) return null;
  const { currentMidi, rawlProps, handleSongClick, eject, analyses, user, loadingUser, saveSnippetForKey } = app;
  const canAnnotateCorpus = !loadingUser && user?.email === "cxielamiko@gmail.com";
  const playing = !!selected && !!currentMidi && !!rawlProps?.parsingResult;

  const openCandidate = async (candidate: ResultItem) => {
    setLoading(candidate.slug);
    setSelected(null);
    try {
      if (currentMidi && currentMidi.slug !== candidate.slug) eject();
      await handleSongClick(candidate.slug, { startPaused: true });
      setSelected(candidate);
    } finally {
      setLoading(null);
    }
  };

  const saveCandidate = async (candidate: ResultItem, tag: string) => {
    if (!canAnnotateCorpus) return;
    const id = `${candidate.slug}:${candidate.from}-${candidate.to}`;
    setSaving(id);
    setSaveErrors((previous) => ({ ...previous, [id]: "" }));
    try {
      await saveSnippetForKey(`f/${candidate.slug}`, {
        ...(candidate.snippet as unknown as Snippet),
        tag,
      }, LABEL_TAGS);
    } catch (error) {
      console.error("Could not label search result", error);
      setSaveErrors((previous) => ({ ...previous, [id]: "Could not save label. Try again." }));
    } finally {
      setSaving(null);
    }
  };

  const newCandidates: Candidate[] = [];
  const dynamicallyTagged: DynamicTagged[] = [];
  for (const candidate of results.candidates) {
    const savedSnippets = (analyses[`f/${candidate.slug}`]?.snippets || []).filter((snippet) =>
      LABEL_TAGS.includes(snippet.tag));
    if (!savedSnippets.length) {
      newCandidates.push(candidate);
      continue;
    }
    const saved = savedSnippets.find((snippet) =>
      snippet.measuresSpan[0] === candidate.from && snippet.measuresSpan[1] === candidate.to);
    if (saved) dynamicallyTagged.push({ ...candidate, snippet: saved,
      status: saved.tag === NEGATIVE_TAG ? "negative" : "pass" });
  }
  const downloadedTagged: (TaggedSnippet | LiveTagged)[] = results.taggedSnippets.map((candidate) => {
    const saved = (analyses[`f/${candidate.slug}`]?.snippets || []).find((snippet) =>
      LABEL_TAGS.includes(snippet.tag) &&
      snippet.measuresSpan[0] === candidate.from && snippet.measuresSpan[1] === candidate.to);
    if (!saved) return candidate;
    return { ...candidate, snippet: saved, status: saved.tag === NEGATIVE_TAG ? "negative" :
      candidate.rank != null ? "pass" : candidate.status === "unscanned" ? "unscanned" : "fail" } as LiveTagged;
  });
  const taggedResults = [...downloadedTagged, ...dynamicallyTagged];
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
    negative: taggedResults.filter((item) => item.status === "negative").length,
    unscanned: taggedResults.filter((item) => item.status === "unscanned").length,
  };

  return (
    <>
      <Page $playing={playing}>
        <Intro>
          <h1>Chromatic bass from minor i · search results</h1>
          <p>Up to 100 new MIDI candidates from pieces without a saved example, plus your tagged snippets. Bass notes must onset on strong beats and change at an even pace, allowing occasional doubled gaps. A sustained major third cannot dominate the opening or lead into the descent. The ranking uses a linear score tuned on {results.ranker.trainingExamples + results.ranker.unretrievedExamples} positive and {results.ranker.explicitNegatives} negative labels; rank is the position among all detected passages and stays fixed when filtering.</p>
          <p>Click a snippet to open that passage in Rawl. {results.scanned.toLocaleString()} local MIDI files were scanned. The ♭3:3 count, opening i-chord plausibility, and distance from the annotated key also contribute to rank. <Link to="/s/bass/chromatic_line_down_from_minor_i">View tagged examples</Link>.</p>
          <Filters aria-label="Filter bass search results">
            {(["all", "new", "tagged", "pass", "fail", "negative", "unscanned"] as Filter[]).map((choice) => (
              <button key={choice} type="button" aria-pressed={filter === choice}
                onClick={() => { setFilter(choice); setOpenInfoId(null); }}>
                {{ all: "All", new: "New", tagged: "My snippets", pass: "Pass", fail: "Fail", negative: "Negative", unscanned: "Not scanned" }[choice]} ({counts[choice]})
              </button>
            ))}
          </Filters>
          <p>Pass means the detector found a passage overlapping at least two measures of your snippet. Fail means it found none. Negative means you marked the passage as lacking this feature; these labels inform the current ranking model. Unranked snippets did not pass; “Not scanned” has no indexed MIDI.</p>
        </Intro>
        <Grid>
          {visibleResults.length === 0 && <p>No snippets in this filter yet.</p>}
          {visibleResults.map((candidate, index) => {
            const id = `${candidate.slug}:${candidate.from}-${candidate.to}`;
            const savedSnippet = (analyses[`f/${candidate.slug}`]?.snippets || []).find((snippet) =>
              LABEL_TAGS.includes(snippet.tag) &&
              snippet.measuresSpan[0] === candidate.from &&
              snippet.measuresSpan[1] === candidate.to);
            const savedTag = savedSnippet?.tag ?? ("status" in candidate
              ? candidate.status === "negative" ? NEGATIVE_TAG : POSITIVE_TAG : null);
            const label = savedTag === NEGATIVE_TAG ? "negative" :
              savedTag === POSITIVE_TAG ? "positive" : null;
            return (
            <Card key={`${"status" in candidate ? "tagged" : "new"}:${candidate.slug}:${candidate.from}`}
              $label={label}
              $infoOpen={openInfoId === id}
              style={{ width: Math.max(320, (candidate.to - candidate.from + 1) * PX_IN_MEASURE) }}>
              <CardHeader>
                <div><Rank>{candidate.rank == null ? "Unranked" : `#${candidate.rank}`} </Rank>
                  <Link to={`/f/${candidate.slug}`}>{candidate.title || candidate.slug}</Link>
                  {"status" in candidate && <Badge $status={candidate.status}>
                    {candidate.status === "pass" ? "MY SNIPPET · PASS" : candidate.status === "fail" ? "MY SNIPPET · FAIL" :
                      candidate.status === "negative" ? "MY SNIPPET · NEGATIVE" : "MY SNIPPET · NOT SCANNED"}
                  </Badge>}
                </div>
                <CardActions>
                  <CardActionButton type="button" aria-label={`Ranking factors for ${candidate.title || candidate.slug}`}
                    aria-expanded={openInfoId === id} aria-controls={`ranking-factors-${index}`}
                    onClick={() => setOpenInfoId((open) => open === id ? null : id)}>
                    <InfoIcon />
                  </CardActionButton>
                  {canAnnotateCorpus && <>
                    <CardActionButton type="button" disabled={loadingUser || label === "positive" && !saveErrors[id] || saving === id}
                      onClick={() => void saveCandidate(candidate, POSITIVE_TAG)}
                      title={loadingUser ? "Loading snippets…" : saving === id ? "Saving snippet…" : label === "positive" ? "Saved snippet" : "Save snippet"}
                      aria-label={`${label === "positive" ? "Saved snippet" : "Save snippet"} for ${candidate.title || candidate.slug}, measures ${candidate.from}–${candidate.to}`}>
                      <SaveIcon saved={label === "positive"} />
                    </CardActionButton>
                    <CardActionButton type="button" disabled={loadingUser || label === "negative" && !saveErrors[id] || saving === id}
                      onClick={() => void saveCandidate(candidate, NEGATIVE_TAG)}
                      title={loadingUser ? "Loading snippets…" : saving === id ? "Saving label…" : label === "negative" ? "Marked negative" : "Mark as negative: this passage lacks the feature"}
                      aria-label={`${label === "negative" ? "Marked negative" : "Mark as negative"} for ${candidate.title || candidate.slug}, measures ${candidate.from}–${candidate.to}`}>
                      <NegativeIcon saved={label === "negative"} />
                    </CardActionButton>
                  </>}
                </CardActions>
              </CardHeader>
              {openInfoId === id && <RankingPanel id={`ranking-factors-${index}`}
                role="region" aria-label={`Ranking factors for ${candidate.title || candidate.slug}`}>
                {candidate.rankingBreakdown ? <>
                  <h2>Ranking score: {candidate.rankingScore?.toFixed(4)}</h2>
                  <p>Points are relative to the average detected passage. Positive points raise this result.</p>
                  {candidate.rankingBreakdown.map((factor) => (
                    <FactorRow key={factor.feature}>
                      <span>{FACTOR_LABELS[factor.feature] || factor.feature}
                        <small>{factorValue(factor, candidate.detectedTonic, candidate.annotatedKey)}</small></span>
                      <strong style={{ color: factor.contribution >= 0 ? "#9cdbac" : "#e2a39e" }}>
                        {factor.contribution >= 0 ? "+" : ""}{factor.contribution.toFixed(5)}
                      </strong>
                    </FactorRow>
                  ))}
                  <p>Phrase-start annotations are not scored because most new MIDI files lack them.</p>
                  <p>Opening i-chord plausibility compares tonic, minor third, and fifth with ♭2, major third, ♯4, and ♭6 before the next bass change.</p>
                  <p>Key distance uses the shortest pitch-class interval (0–6 semitones). Missing annotations add no penalty.</p>
                </> : <p>{"scanned" in candidate && !candidate.scanned
                  ? "This snippet has no ranking score because its MIDI was not scanned."
                  : "This snippet has no ranking score because the detector found no overlapping passage."}</p>}
              </RankingPanel>}
              {saveErrors[id] && <Details role="alert">{saveErrors[id]}</Details>}
              <Details>
                {candidate.bassNotes != null && <span>{candidate.bassNotes} bass notes</span>}
                {candidate.harmonicPulseBeats != null && <span>every {Number(candidate.harmonicPulseBeats.toFixed(2))} beat{Math.abs(candidate.harmonicPulseBeats - 1) < 0.01 ? "" : "s"}</span>}
                {candidate.doubledGaps != null && candidate.doubledGaps > 0 && <span>{candidate.doubledGaps} doubled gap{candidate.doubledGaps === 1 ? "" : "s"}</span>}
                {candidate.minorSupport != null && <span>minor chord: {candidate.minorSupport}/2</span>}
                {candidate.minorThirdAttacks != null && candidate.majorThirdAttacks != null && <span
                  title="Minor-third to major-third note attacks relative to the opening bass; detected bass notes excluded">
                  ♭3:3 = {candidate.minorThirdAttacks}:{candidate.majorThirdAttacks}
                </span>}
                {candidate.skipped != null && candidate.skipped > 0 && <span>{candidate.skipped} skipped steps</span>}
              </Details>
              <PreviewButton type="button" onClick={() => void openCandidate(candidate)}
                disabled={"scanned" in candidate && !candidate.scanned}
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
        <InlineRawlPlayer measureStart={selected.from} playAfterSeek onEject={() => setSelected(null)} />
      )}
    </>
  );
};

export default ChromaticMinorBassSearch;
