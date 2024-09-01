import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { VoiceMask } from "../../App";
import { SecondsConverter, SetVoiceMask } from "../Rawl";
import { ScrollInfo } from "../SystemLayout";

export const VoiceName: React.FC<{
  voiceName: string;
  voiceMask: VoiceMask;
  setVoiceMask: SetVoiceMask;
  voiceIndex: number;
  scrollInfo: ScrollInfo;
  secondsToX: SecondsConverter;
  midiNumberToY: (number) => number;
}> = ({
  voiceName,
  voiceMask,
  setVoiceMask,
  voiceIndex,
  scrollInfo,
  secondsToX,
  midiNumberToY,
}) => {
  const isSingleActive =
    voiceMask[voiceIndex] && voiceMask.filter((voice) => voice).length === 1;

  const ref = useRef(null);
  const [top, setTop] = useState(0);

  const updatePosition = () => {
    if (ref.current) {
      const outerComponentRect =
        ref.current.parentElement.getBoundingClientRect();
      setTop(outerComponentRect.top + window.scrollY - 5);
    }
  };

  useEffect(updatePosition, [scrollInfo, secondsToX, midiNumberToY]);

  useEffect(() => {
    ref.current
      .closest(".SplitLayout")
      ?.addEventListener("scroll", updatePosition);

    ref.current.closest(".Rawl")?.addEventListener("scroll", updatePosition);

    return () => {
      ref.current
        .closest(".SplitLayout")
        ?.removeEventListener("scroll", updatePosition);
      ref.current
        .closest(".Rawl")
        ?.removeEventListener("scroll", updatePosition);
    };
  }, []);

  return (
    <span
      style={{
        position: "fixed",
        top,
        left: 2,
        marginLeft: 2,
        marginTop: 7,
        fontFamily: "sans-serif",
        fontSize: 12,
        textShadow: "0 0 1px black, 0 0 3px black, 0 0 6px black",
        userSelect: "none",
        zIndex: 100,
      }}
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <span>
        <button
          style={{
            cursor: "pointer",
            userSelect: "none",
            fontFamily: "sans-serif",
            fontSize: 12,
          }}
          onClick={(e) => {
            e.stopPropagation();
            isSingleActive
              ? setVoiceMask(voiceMask.map(() => true))
              : setVoiceMask(voiceMask.map((_, i) => i === voiceIndex));
          }}
        >
          {isSingleActive ? "Unsolo All" : "Solo"}
        </button>

        <input
          title="active"
          type="checkbox"
          onChange={(e) => {
            e.stopPropagation();
            setVoiceMask(
              voiceMask.map((value, i) => (i === voiceIndex ? !value : value)),
            );
          }}
          checked={voiceMask[voiceIndex]}
          style={{
            margin: "0px 0px 0px 17px",
            height: 11,
            display: isSingleActive ? "none" : "inline",
          }}
        />
      </span>
      <span
        style={{
          color: voiceMask[voiceIndex] ? "white" : "#444",
          marginLeft: "10px",
          zIndex: 100,
        }}
      >
        {voiceName}
      </span>
    </span>
  );
};
