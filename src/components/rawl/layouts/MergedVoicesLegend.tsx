import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useLocalStorage } from "usehooks-ts";
import { AppContext } from "../../AppContext";
import Drum from "../../icons/Drum";
import ArrowUp from "../../icons/ArrowUp";
import ArrowDown from "../../icons/ArrowDown";
import StrummingChevrons from "../../icons/StrummingChevrons";
import Pencil from "../../icons/Pencil";
import Trash2 from "../../icons/Trash2";
import { SongNarrative } from "../SongNarrative";
import { ColoredNotesInVoices } from "../parseMidi";
import { getSortedVoices } from "../voiceOrder";

export const FORCED_PANNING_LABEL = "🔊⬅️➡️🔊";

const VoiceActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 16px;
  margin-left: 3px;
  padding: 0 2px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: #aaa;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;

  &[aria-pressed="true"] {
    color: #8ee8d0;
  }

  &:hover,
  &:focus-visible {
    background: #333;
    color: white;
  }

  &:focus-visible {
    opacity: 1;
    pointer-events: auto;
  }
`;

const VoiceRow = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  line-height: 16px;

  &:hover ${VoiceActionButton} {
    opacity: 1;
    pointer-events: auto;
  }
`;

const reorderFlash = keyframes`
  0%, 100% { background-color: transparent; box-shadow: none; }
  20%, 60% {
    background-color: rgba(142, 232, 208, 0.22);
    box-shadow: 0 0 10px rgba(142, 232, 208, 0.45);
  }
`;

const VoiceList = styled.div<{ $flashing: boolean }>`
  border-radius: 4px;
  animation: ${({ $flashing }) => $flashing ? reorderFlash : "none"} 900ms ease-out;
`;

const VoiceCheckbox = styled.input`
  flex-shrink: 0;
  width: 11px;
  height: 11px;
  margin: 0 3px 0 17px;
  cursor: pointer;
`;

type MergedVoicesLegendProps = {
  voiceNames: string[];
  notes: ColoredNotesInVoices;
  voiceMask: boolean[];
  setVoiceMask: (mask: boolean[]) => void;
  onVoiceHover: (voiceIndex: number | null) => void;
  onForcedPanningChange?: (enabled: boolean) => void;
  slug: string;
  excludedVoices?: number[];
  drumVoices?: number[];
  nativeDrumVoices?: number[];
  strummingVoices?: number[];
  onRenameVoice?: (voiceIndex: number) => void;
  onRenameVoicesWithInstrumentTimbres?: () => void;
  voiceOctaveShifts?: Record<number, number>;
  onShiftVoiceOctave?: (voiceIndex: number, direction: 1 | -1) => void;
  onAutoArrangeVoices?: () => void;
  onToggleVoiceStrumming?: (voiceIndex: number) => void;
  onToggleVoiceDrum?: (voiceIndex: number) => void;
  onToggleVoiceExcluded?: (voiceIndex: number) => void;
  currentTonic?: number;
};

const MergedVoicesLegend: React.FC<MergedVoicesLegendProps> = ({
  voiceNames,
  notes,
  voiceMask,
  setVoiceMask,
  onVoiceHover,
  onForcedPanningChange,
  slug,
  currentTonic,
  excludedVoices = [],
  drumVoices = [],
  nativeDrumVoices = [],
  onRenameVoice,
  onRenameVoicesWithInstrumentTimbres,
  voiceOctaveShifts = {},
  onShiftVoiceOctave,
  onAutoArrangeVoices,
  strummingVoices = [],
  onToggleVoiceStrumming,
  onToggleVoiceDrum,
  onToggleVoiceExcluded,
}) => {
  const { user } = useContext(AppContext);
  const canEditArrangement = !!user && !!onToggleVoiceExcluded;
  const [forcedPanning, setForcedPanning] = useLocalStorage(
    "forcedPanning",
    false,
  );
  const excluded = new Set(excludedVoices);
  const allIncluded = voiceMask.map((_, index) => !excluded.has(index));
  const targetVoices = useMemo(
    () => getSortedVoices(voiceNames, notes, drumVoices, nativeDrumVoices),
    [voiceNames, notes, drumVoices, nativeDrumVoices],
  );

  const targetOrder = targetVoices.map(({ voiceIndex }) => voiceIndex).join(",");
  const shiftKey = JSON.stringify(
    voiceNames.map((_, index) => voiceOctaveShifts[index] ?? 0),
  );
  const [displayedOrder, setDisplayedOrder] = useState(targetOrder);
  const [flashing, setFlashing] = useState(false);
  const previousShifts = useRef({ slug, shiftKey });
  const reorderAt = useRef(0);

  useEffect(() => {
    if (previousShifts.current.slug !== slug) {
      reorderAt.current = 0;
      setFlashing(false);
    } else if (previousShifts.current.shiftKey !== shiftKey) {
      // Keep the buttons in place until five seconds after the last octave edit.
      reorderAt.current = Date.now() + 5000;
    }
    previousShifts.current = { slug, shiftKey };
    const delay = Math.max(0, reorderAt.current - Date.now());
    if (!delay) {
      setDisplayedOrder(targetOrder);
      return;
    }
    const timer = window.setTimeout(() => {
      reorderAt.current = 0;
      if (displayedOrder !== targetOrder) {
        onVoiceHover(null);
        setDisplayedOrder(targetOrder);
        setFlashing(true);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [slug, shiftKey, targetOrder, displayedOrder, onVoiceHover]);

  useEffect(() => {
    if (!flashing) return;
    const timer = window.setTimeout(() => setFlashing(false), 900);
    return () => window.clearTimeout(timer);
  }, [flashing]);

  const order = displayedOrder.split(",").map(Number);
  const sortedVoices = [...targetVoices].sort(
    (a, b) => order.indexOf(a.voiceIndex) - order.indexOf(b.voiceIndex),
  );

  const handlePanningToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setForcedPanning(newValue);
    onForcedPanningChange?.(newValue);
  };

  return (
    (voiceNames.length > 1 || canEditArrangement) && (
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 0,
          zIndex: 90000,
          backgroundColor: "transparent",
          padding: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 10,
            borderBottom: "0.5px solid #333",
            paddingBottom: 5,
          }}
        >
          <VoiceCheckbox
            type="checkbox"
            id="forcedPanning"
            checked={forcedPanning}
            onChange={handlePanningToggle}
          />
          <label
            htmlFor="forcedPanning"
            style={{
              margin: "0px 0px 0px 0px",
              display: "inline-flex",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            {FORCED_PANNING_LABEL}
          </label>
        </div>
        {canEditArrangement && onRenameVoicesWithInstrumentTimbres && (
          <button
            type="button"
            onClick={() => {
              onVoiceHover(null);
              onRenameVoicesWithInstrumentTimbres();
            }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              margin: "0 0 8px 17px", padding: "3px 5px",
              fontSize: 11, color: "#aaa", background: "#111",
              border: "1px solid #333", borderRadius: 3, cursor: "pointer",
            }}
          >
            <Pencil />
            Rename voices with instrument timbres
          </button>
        )}
        {!!user && onAutoArrangeVoices && (
          <button
            type="button"
            onClick={() => {
              onVoiceHover(null);
              onAutoArrangeVoices();
            }}
            disabled={targetVoices.filter(({ voiceIndex, isDrum }) =>
              !isDrum && !excluded.has(voiceIndex) && notes[voiceIndex]?.length,
            ).length < 2}
            title="Keep the lowest voice fixed and raise each higher voice by octaves until at most 5% of its notes overlap lower voices in time and pitch"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              margin: "0 0 8px 17px", padding: "3px 5px",
              fontSize: 11, color: "#aaa", background: "#111",
              border: "1px solid #333", borderRadius: 3, cursor: "pointer",
            }}
          >
            <ArrowUp />
            Auto-arrange voices
          </button>
        )}
        <VoiceList $flashing={flashing}>
        {sortedVoices.map(
          ({ voiceName, voiceIndex, isDrum }) =>
            !excluded.has(voiceIndex) && (
              <VoiceRow key={voiceIndex}>
                <VoiceCheckbox
                  id={`voice-active-${voiceIndex}`}
                  type="checkbox"
                  onChange={(e) => {
                    e.stopPropagation();
                    let newVoiceMask = voiceMask.map((value, i) =>
                      i === voiceIndex ? !value : value,
                    );
                    if (newVoiceMask.filter((voice) => voice).length === 0) {
                      newVoiceMask = allIncluded;
                    }
                    setVoiceMask(newVoiceMask);
                  }}
                  checked={voiceMask[voiceIndex]}
                />{" "}
                <label
                  htmlFor={`voice-active-${voiceIndex}`}
                  aria-label={`${voiceName}: click to solo or unsolo, hover to solo temporarily`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const isSingleActive =
                      voiceMask[voiceIndex] &&
                      voiceMask.filter(Boolean).length === 1;
                    onVoiceHover(null);
                    setVoiceMask(
                      isSingleActive
                        ? allIncluded
                        : voiceMask.map((_, index) => index === voiceIndex),
                    );
                  }}
                  onMouseEnter={() => onVoiceHover(voiceIndex)}
                  onMouseLeave={() => onVoiceHover(null)}
                  style={{
                    margin: 0,
                    display: "inline-flex",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <span
                    className={isDrum ? undefined : `voiceShape-${voiceIndex}`}
                    style={{
                      display: "inline-block",
                      cursor: "pointer",
                      backgroundColor: voiceMask[voiceIndex] !== isDrum
                        ? "white"
                        : "black",
                      padding: "0px 6px",
                      fontSize: "12px",
                      marginRight: 5,
                      verticalAlign: "middle",
                      color: voiceMask[voiceIndex] !== isDrum ? "black" : "white",
                    }}
                  >
                    {voiceName}
                  </span>
                </label>
                {!!user && onShiftVoiceOctave && !isDrum && (
                  <>
                    {([-1, 1] as const).map((direction) => (
                      <VoiceActionButton
                        key={direction}
                        type="button"
                        aria-label={`Shift voice ${voiceIndex + 1} ${direction === 1 ? "up" : "down"} one octave: ${voiceName}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onVoiceHover(null);
                          onShiftVoiceOctave(voiceIndex, direction);
                        }}
                      >
                        {direction === 1 ? <ArrowUp /> : <ArrowDown />}
                      </VoiceActionButton>
                    ))}
                    {!!voiceOctaveShifts[voiceIndex] && (
                      <span
                        style={{ color: "#8ee8d0", fontSize: 11, marginLeft: 3 }}
                      >
                        {voiceOctaveShifts[voiceIndex] > 0 ? "+" : ""}{voiceOctaveShifts[voiceIndex]} oct
                      </span>
                    )}
                  </>
                )}
                {!!user && onRenameVoice && (
                  <VoiceActionButton
                    type="button"
                    aria-label={`Rename voice ${voiceIndex + 1}: ${voiceName}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onVoiceHover(null);
                      onRenameVoice(voiceIndex);
                    }}
                  >
                    <Pencil />
                  </VoiceActionButton>
                )}
                {!!user && onToggleVoiceStrumming && !isDrum && (
                  <VoiceActionButton
                    type="button"
                    aria-label={`${strummingVoices.includes(voiceIndex)
                      ? "Make not strumming" : "Make strumming"} voice ${voiceIndex + 1}: ${voiceName}`}
                    aria-pressed={strummingVoices.includes(voiceIndex)}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleVoiceStrumming(voiceIndex);
                    }}
                  >
                    <StrummingChevrons inward={!strummingVoices.includes(voiceIndex)} />
                  </VoiceActionButton>
                )}
                {!!user &&
                  onToggleVoiceDrum &&
                  !nativeDrumVoices.includes(voiceIndex) && (
                    <VoiceActionButton
                      type="button"
                      aria-label={`${
                        drumVoices.includes(voiceIndex)
                          ? "Restore pitched"
                          : "Make drum"
                      } voice ${voiceIndex + 1}: ${voiceName}`}
                      aria-pressed={drumVoices.includes(voiceIndex)}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleVoiceDrum(voiceIndex);
                      }}
                    >
                      <Drum />
                    </VoiceActionButton>
                  )}
                {canEditArrangement && (
                  <VoiceActionButton
                    type="button"
                    aria-label={`Remove voice ${voiceIndex + 1}: ${voiceName}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onVoiceHover(null);
                      onToggleVoiceExcluded(voiceIndex);
                    }}
                  >
                    <Trash2 />
                  </VoiceActionButton>
                )}
              </VoiceRow>
            ),
        )}
        </VoiceList>
        {excludedVoices.length > 0 && canEditArrangement && (
          <details style={{ marginTop: 8, background: "#111", padding: 6 }}>
            <summary style={{ cursor: "pointer" }}>
              Removed voices ({excludedVoices.length})
            </summary>
            {excludedVoices.map((index) => (
              <div key={index} style={{ marginTop: 6 }}>
                {index + 1}. {voiceNames[index] || `Voice ${index + 1}`}{" "}
                <button
                  type="button"
                  onClick={() => onToggleVoiceExcluded(index)}
                  aria-label={`Restore voice ${index + 1}: ${
                    voiceNames[index] || ""
                  }`}
                >
                  Restore
                </button>
              </div>
            ))}
          </details>
        )}
        <div style={{ position: "relative" }}>
          <SongNarrative slug={slug} currentTonic={currentTonic} />
        </div>
      </div>
    )
  );
};

export default MergedVoicesLegend;
