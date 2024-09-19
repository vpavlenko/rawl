import React from "react";

type MergedVoicesLegendProps = {
  voiceNames: string[];
  voiceMask: boolean[];
  setVoiceMask: (mask: boolean[]) => void;
};

const MergedVoicesLegend: React.FC<MergedVoicesLegendProps> = ({
  voiceNames,
  voiceMask,
  setVoiceMask,
}) => {
  const isSingleActive = voiceMask.filter((voice) => voice).length === 1;

  return (
    voiceNames.length > 1 && (
      <div
        style={{
          position: "fixed",
          top: 50,
          right: 100,
          zIndex: 90000,
          backgroundColor: "black",
          padding: 10,
        }}
      >
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
      </div>
    )
  );
};

export default MergedVoicesLegend;
