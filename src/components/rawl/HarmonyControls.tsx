import React, { useEffect, useMemo } from "react";
import { HarmonyResult } from "../../harmony/harmony";
import { analysisProposal } from "../../harmony/proposals";
import { Link } from "react-router-dom";
export default function HarmonyControls({
  enabled,
  onToggle,
  result,
  measures,
  loading,
  onRecalculate,
}: {
  enabled: boolean;
  onToggle: () => void;
  result: HarmonyResult | null;
  measures: number[];
  loading: boolean;
  onRecalculate: () => void;
}) {
  const buttonStyle: React.CSSProperties = {
    background: "#211c2c",
    color: "#e1d1fb",
    border: "1px solid #655577",
    borderRadius: 4,
    padding: "5px 9px",
    cursor: "pointer",
    fontSize: 12,
  };
  const proposal = useMemo(
    () => (result ? analysisProposal(result, measures) : null),
    [result, measures],
  );
  const exportUrl = useMemo(
    () =>
      proposal
        ? URL.createObjectURL(
            new Blob(
              [
                JSON.stringify(
                  {
                    status: "inferred proposal; review before saving",
                    version: result.version,
                    ...proposal,
                  },
                  null,
                  2,
                ),
              ],
              { type: "application/json" },
            ),
          )
        : null,
    [proposal, result?.version],
  );
  useEffect(
    () => () => {
      if (exportUrl) URL.revokeObjectURL(exportUrl);
    },
    [exportUrl],
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        padding: "8px 12px",
        color: "#aaa",
        fontSize: 12,
      }}
    >
      <button style={buttonStyle} onClick={onToggle} aria-pressed={enabled}>
        {enabled ? "Hide harmonies" : "Show harmonies"}
      </button>
      {enabled && (
        <>
          {loading ? (
            <span role="status">Loading corpus analysis…</span>
          ) : (
            <span>
              Estimated chords · dashed = uncertain ·{" "}
              {result?.phrases.length ?? 0} phrase and{" "}
              {result?.sections.length ?? 0} section suggestions
            </span>
          )}
          <button style={buttonStyle} onClick={onRecalculate}>
            Recalculate from MIDI
          </button>
          {exportUrl && (
            <a
              download="suggested-analysis.json"
              href={exportUrl}
              style={{ color: "#cbb2f1" }}
            >
              Download suggested analysis
            </a>
          )}
          <Link to="/discover/harmony" style={{ color: "#cbb2f1" }}>
            Search progressions
          </Link>
          {!!result?.warnings.length && (
            <span role="status">{result.warnings.join(" ")}</span>
          )}
        </>
      )}
    </div>
  );
}
