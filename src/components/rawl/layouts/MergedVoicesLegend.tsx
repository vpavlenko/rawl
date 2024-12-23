import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { SongNarrative } from "../SongNarrative";

export const FORCED_PANNING_LABEL = "🔊⬅️👐➡️🔊";

type MergedVoicesLegendProps = {
  voiceNames: string[];
  voiceMask: boolean[];
  setVoiceMask: (mask: boolean[]) => void;
  onForcedPanningChange?: (enabled: boolean) => void;
  slug: string;
};

const MergedVoicesLegend: React.FC<MergedVoicesLegendProps> = ({
  voiceNames,
  voiceMask,
  setVoiceMask,
  onForcedPanningChange,
  slug,
}) => {
  const [forcedPanning, setForcedPanning] = useLocalStorage(
    "forcedPanning",
    false,
  );
  const isSingleActive = voiceMask.filter((voice) => voice).length === 1;

  const handlePanningToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setForcedPanning(newValue);
    onForcedPanningChange?.(newValue);
    window.location.reload();
  };

  return (
    voiceNames.length > 1 && (
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
        {voiceNames.map((voiceName, voiceIndex) => (
          <div key={voiceIndex}>
            <input
              title="active"
              type="checkbox"
              onChange={(e) => {
                e.stopPropagation();
                let newVoiceMask = voiceMask.map((value, i) =>
                  i === voiceIndex ? !value : value,
                );
                if (newVoiceMask.filter((voice) => voice).length === 0) {
                  newVoiceMask = voiceMask.map(() => true);
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
                  ? setVoiceMask(voiceMask.map(() => true))
                  : setVoiceMask(voiceMask.map((_, i) => i === voiceIndex));
              }}
            >
              <span
                className={`voiceShape-${voiceIndex}`}
                style={{
                  display: "inline-block",
                  backgroundColor: "white",
                  height: 8,
                  width: 20,
                  marginRight: 5,
                  verticalAlign: "middle",
                }}
              />
              <span style={{ borderBottom: "0.5px dashed #ccc" }}>
                {voiceName}
              </span>
            </span>
          </div>
        ))}
        <div style={{ position: "relative" }}>
          <SongNarrative slug={slug} />
        </div>
      </div>
    )
  );
};

export default MergedVoicesLegend;
