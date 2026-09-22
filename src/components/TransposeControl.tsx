import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import X from "./icons/X";

const NOTE_NAMES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
const OFFSETS = Array.from({ length: 25 }, (_, index) => index - 12);
const pitchClass = (value: number) => ((value % 12) + 12) % 12;
const signed = (value: number) =>
  value < 0 ? `−${Math.abs(value)}` : value > 0 ? `+${value}` : "0";

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 24px;
`;

const ControlButton = styled.button`
  height: 24px;
  min-width: 22px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 11px;
  border-radius: 3px;
  transition: none;
  &:hover:not(:disabled), &:focus-visible {
    background: #ffffff26;
    color: white;
  }
  &:active:not(:disabled) {
    background: #ffffff45;
    transform: translateY(1px) scale(0.94);
    box-shadow: inset 0 1px 3px #0008;
    transition: none;
  }
  &[aria-expanded="true"] {
    background: #ffffff26;
    color: white;
    box-shadow: inset 0 -2px white;
  }
  &:disabled { opacity: 0.3; cursor: default; }
  &:focus-visible { outline: 1px solid white; }
`;

const ValueButton = styled(ControlButton)`
  min-width: 44px;
  font-family: monospace;
  font-variant-numeric: tabular-nums;
`;

const CloseButton = styled(ControlButton)`
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 0 5px 0 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:active:not(:disabled) {
    transform: none;
  }
`;

const Picker = styled.div`
  position: fixed;
  bottom: 33px;
  left: 50%;
  transform: translateX(-50%);
  width: 760px;
  max-width: calc(100vw - 16px);
  padding: 14px 20px;
  box-sizing: border-box;
  border: 1px solid #777;
  border-radius: 6px;
  background: var(--background);
  color: var(--neutral4);
  box-shadow: 0 4px 20px #0008;
`;

const Choices = styled.div`
  display: grid;
  grid-template-columns: repeat(25, minmax(0, 1fr));
  gap: 2px;
  margin-top: 12px;
  padding: 2px 0;
  @media (max-width: 700px) {
    grid-template-columns: repeat(auto-fit, minmax(24px, 1fr));
    row-gap: 10px;
  }
`;

const Choice = styled.button<{ $selected: boolean }>`
  display: grid;
  grid-template-rows: repeat(2, 16px);
  justify-items: center;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: 0 0 5px;
  border: 0;
  border-bottom: 2px solid ${({ $selected }) => $selected ? "white" : "transparent"};
  border-radius: 0;
  background: transparent;
  color: ${({ $selected }) => $selected ? "white" : "#aaa"};
  font-family: Arial, sans-serif;
  font-size: 10px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  line-height: 16px;
  white-space: nowrap;
  cursor: pointer;
  transition: none;
  &:hover, &:focus-visible {
    background: #ffffff26;
    color: white;
  }
  &:active {
    background: #ffffff45;
    transform: translateY(1px);
    transition: none;
  }
  &:focus-visible { outline: 1px solid white; outline-offset: -1px; }
`;

const AlignedSymbol = styled.span`
  position: relative;
  display: inline-block;
  width: 1ch;
  height: 16px;
  line-height: 16px;
  text-align: center;
`;

const Accidental = styled.span<{ $before: boolean }>`
  position: absolute;
  top: 0;
  ${({ $before }) => $before ? "right: 100%;" : "left: 100%;"}
  width: 0.8em;
  height: 16px;
  line-height: 16px;
  text-align: center;
`;

function PitchLabel({ text }: { text: string }) {
  const accidental = text.match(/[♭♯]/)?.[0];
  return (
    <AlignedSymbol>
      {text.replace(/[♭♯]/g, "")}
      {accidental && (
        <Accidental $before={text.startsWith(accidental)}>{accidental}</Accidental>
      )}
    </AlignedSymbol>
  );
}

export default function TransposeControl({ value, onChange, firstTonic }: {
  value: number;
  onChange: (semitones: number) => void;
  firstTonic: number | null;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    selectedRef.current?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return (
    <Container
      ref={containerRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          valueRef.current?.focus();
        }
      }}
    >
      <ControlButton
        onClick={() => onChange(value - 1)}
        disabled={value <= -12}
        title="Transpose down one semitone"
        aria-label="Transpose down one semitone"
      >▼</ControlButton>
      <ValueButton
        ref={valueRef}
        onClick={() => setOpen(!open)}
        title="Choose transposition (semitones)"
        aria-label={`Transpose: ${signed(value)} semitones`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >{signed(value)} st</ValueButton>
      <ControlButton
        onClick={() => onChange(value + 1)}
        disabled={value >= 12}
        title="Transpose up one semitone"
        aria-label="Transpose up one semitone"
      >▲</ControlButton>
      {open && (
        <Picker role="dialog" aria-label="Transpose in semitones">
          <div style={{ fontSize: 12, paddingRight: 24 }}>Transpose · semitones</div>
          <CloseButton
            type="button"
            title="Close transposition picker"
            aria-label="Close transposition picker"
            onClick={() => {
              setOpen(false);
              valueRef.current?.focus();
            }}
          >
            <X />
          </CloseButton>
          <Choices role="group" aria-label="Transposition in semitones">
              {OFFSETS.map((offset) => {
                const tonic = firstTonic === null ? null : NOTE_NAMES[pitchClass(firstTonic + offset)];
                return (
                  <Choice
                    key={offset}
                    $selected={offset === value}
                    ref={offset === value ? selectedRef : undefined}
                    title={`${signed(offset)} semitones${tonic ? ` · ${tonic}` : ""}`}
                    aria-label={`${signed(offset)} semitones${tonic ? `, tonic ${tonic}` : ""}`}
                    aria-pressed={offset === value}
                    onClick={() => onChange(offset)}
                  >
                    <span>{signed(offset)}</span>
                    <PitchLabel text={tonic ?? "–"} />
                  </Choice>
                );
              })}
          </Choices>
        </Picker>
      )}
    </Container>
  );
}
