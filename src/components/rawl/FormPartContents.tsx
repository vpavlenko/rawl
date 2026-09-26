import * as React from "react";
import styled from "styled-components";
import { Analysis } from "./analysis";
import { renumberMeasure } from "./AnalysisGrid";

const Contents = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 16px;
  margin: 12px 0;
  font-size: 13px;

  button {
    padding: 2px 0;
    border: none;
    background: transparent;
    color: #bbb;
    font: inherit;
    cursor: pointer;
    text-align: left;
  }

  button:hover,
  button:focus-visible {
    color: white;
    text-decoration: underline;
  }

  button:active {
    color: orange;
  }
`;

export default function FormPartContents({
  analysis,
  measures,
  onSelect,
}: {
  analysis: Analysis;
  measures: number[];
  onSelect: (measure: number) => void;
}) {
  const parts = Object.entries(analysis.form ?? {})
    .map(([measure, name]) => ({ measure: Number(measure), name }))
    .filter(({ measure, name }) =>
      Number.isInteger(measure) && measure > 0 && measure < measures.length &&
      Number.isFinite(measures[measure - 1]) && typeof name === "string" && name.trim(),
    )
    .sort((a, b) => a.measure - b.measure);

  if (!parts.length) return null;

  return (
    <Contents aria-label="Form parts">
      {parts.map(({ measure, name }) => (
        <button
          key={measure}
          type="button"
          title={`Seek and scroll to measure ${renumberMeasure(measure, analysis.measureRenumbering)}`}
          onClick={() => onSelect(measure)}
        >
          {name}
        </button>
      ))}
    </Contents>
  );
}
