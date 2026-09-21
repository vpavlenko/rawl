import React, { useContext, useMemo } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import Trash2 from "../../icons/Trash2";
import Drum from "../../icons/Drum";
import { useLocalStorage } from "usehooks-ts";
import { SongNarrative } from "../SongNarrative";
import { ColoredNotesInVoices } from "../parseMidi";
import { getSortedVoices } from "../voiceOrder";

export const FORCED_PANNING_LABEL = "🔊⬅️👐➡️🔊";

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
`;

const VoiceRow = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  line-height: 16px;

  &:hover ${VoiceActionButton}, &:focus-within ${VoiceActionButton} {
    opacity: 1;
    pointer-events: auto;
  }
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
  const isSingleActive = voiceMask.filter((voice) => voice).length === 1;
  const sortedVoices = useMemo(
    () => getSortedVoices(voiceNames, notes, drumVoices, nativeDrumVoices),
    [voiceNames, notes, drumVoices, nativeDrumVoices],
  );

  const handlePanningToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setForcedPanning(newValue);
    onForcedPanningChange?.(newValue);
    window.location.reload();
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
            marginBottom: 10,
            borderBottom: "0.5px solid #333",
            paddingBottom: 5,
          }}
        >
          <input
            type="checkbox"
            id="forcedPanning"
            checked={forcedPanning}
            onChange={handlePanningToggle}
          />
          <label
            htmlFor="forcedPanning"
            style={{
              margin: "0px 0px 0px 0px",
              height: 11,
              display: "inline",
            }}
          >
            {FORCED_PANNING_LABEL}
          </label>
        </div>
        {sortedVoices.map(
          ({ voiceName, voiceIndex, isDrum }) =>
            !excluded.has(voiceIndex) && (
              <VoiceRow
                key={voiceIndex}
                onMouseEnter={() => onVoiceHover(voiceIndex)}
                onMouseLeave={() => onVoiceHover(null)}
              >
                <input
                  title="active"
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
                  style={{
                    margin: "0px 0px 0px 17px",
                    height: 11,
                    display: "inline",
                  }}
                />{" "}
                <span
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    isSingleActive && voiceMask[voiceIndex]
                      ? setVoiceMask(allIncluded)
                      : setVoiceMask(voiceMask.map((_, i) => i === voiceIndex));
                  }}
                >
                  <span
                    className={isDrum ? undefined : `voiceShape-${voiceIndex}`}
                    style={{
                      display: "inline-block",
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
                </span>
                {!!user &&
                  onToggleVoiceDrum &&
                  !nativeDrumVoices.includes(voiceIndex) && (
                    <VoiceActionButton
                      type="button"
                      title={
                        drumVoices.includes(voiceIndex)
                          ? "Restore pitched voice"
                          : "Make drum: interpret notes as GM drum codes"
                      }
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
                    title={`Remove ${voiceName} from the arrangement and save in annotations`}
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
