import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo, useContext } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AppContext } from "./AppContext";
import TimeSlider from "./TimeSlider";
import VolumeSlider from "./VolumeSlider";

const AppFooter: React.FC<
  {
    currentSongDurationMs: number;
    ejected: boolean;
    paused: boolean;
    volume: number;
    handleTimeSliderChange: any;
    handleVolumeChange: any;
    getCurrentPositionMs: any;
    togglePause: any;
    latencyCorrectionMs: number;
    setLatencyCorrectionMs: (latency: number) => void;
    fileToDownload: Uint8Array;
    tempo: number;
    setTempo: (tempo: number) => void;
  } & RouteComponentProps
> = ({
  currentSongDurationMs,
  ejected,
  paused,
  volume,
  handleTimeSliderChange,
  handleVolumeChange,
  getCurrentPositionMs,
  togglePause,
  latencyCorrectionMs,
  setLatencyCorrectionMs,
  fileToDownload,
  location,
  tempo,
  setTempo,
}) => {
  const context = useContext(AppContext);
  const canDownload = context?.currentMidiBuffer && context?.currentMidi;

  const createBlobUrl = () => {
    if (!context?.currentMidiBuffer) return "";
    const blob = new Blob([context.currentMidiBuffer], { type: "audio/midi" });
    return URL.createObjectURL(blob);
  };

  const getDownloadFilename = () => {
    if (!context?.currentMidi) return "download.mid";
    return `${context.currentMidi.title}.mid`;
  };

  const { pathname } = location;

  const segments = pathname.split("/").filter(Boolean);

  let lastSegment = segments.length > 0 ? segments[segments.length - 1] : "";
  if (!lastSegment.endsWith(".mid")) {
    lastSegment = `${lastSegment}.mid`;
  }

  const handleTempoChange = (delta: number) => {
    const newTempo = Math.max(0.1, Math.min(4, tempo + delta));
    setTempo(Number(newTempo.toFixed(2)));
  };

  const formatTempo = (tempo: number) => {
    const fixed = tempo.toFixed(2);
    const [integer, decimal] = fixed.split(".");
    if (decimal === "00") return integer;
    if (decimal.endsWith("0")) return `${integer}.${decimal[0]}`;
    return fixed;
  };

  const TempoButton: React.FC<{
    delta: number;
    topLabel: string;
    bottomLabel: string;
  }> = ({ delta, topLabel, bottomLabel }) => (
    <button
      onClick={() => handleTempoChange(delta)}
      title={`Change tempo (${delta > 0 ? "Shift+Plus" : "Minus"} key)`}
      className="tempo-button"
      style={{
        width: "24px",
        height: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        color: "#333",
        border: "1px solid #999",
        borderRadius: "3px",
        background: "linear-gradient(to bottom, #f8f8f8 0%, #e0e0e0 100%)",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 2px rgba(255,255,255,0.5)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        padding: "2px 0",
        textShadow: "0 1px 0 rgba(255,255,255,0.8)",
        transition: "all 0.05s ease-in-out",
        fontFamily: "Times New Roman, serif",
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(1px)";
        e.currentTarget.style.boxShadow =
          "0 0 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 2px rgba(255,255,255,0.5)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 2px rgba(255,255,255,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 2px rgba(255,255,255,0.5)";
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          transform: "translateY(-1px)", // Fine-tuned adjustment
        }}
      >
        <span
          style={{
            fontSize: "16px",
            lineHeight: "0.8",
            fontWeight: "bold",
            marginBottom: "-3px", // Overlap adjustment
          }}
        >
          {topLabel}
        </span>
        <span
          style={{
            fontSize: "16px",
            lineHeight: "0.8",
            fontWeight: "bold",
          }}
        >
          {bottomLabel}
        </span>
      </div>
    </button>
  );

  return (
    <div className="AppFooter" style={{ height: 24 }}>
      <div className="AppFooter-main">
        <div className="AppFooter-main-inner">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span style={{ whiteSpace: "nowrap" }}>
              <button
                onClick={togglePause}
                title={paused ? "Resume (use Space)" : "Pause (use Space)"}
                className="box-button"
                disabled={ejected}
                style={{
                  width: "30px",
                  height: "22px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "16px",
                  lineHeight: 1,
                }}
              >
                {paused ? "►" : "⏸"}
              </button>{" "}
            </span>
            <TimeSlider
              paused={paused}
              currentSongDurationMs={currentSongDurationMs}
              getCurrentPositionMs={getCurrentPositionMs}
              onChange={handleTimeSliderChange}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "10px",
              }}
            >
              <TempoButton delta={-0.1} topLabel="_" bottomLabel="-" />
              <span
                style={{
                  margin: "0 15px",
                  fontFamily: "monospace",
                  width: "40px",
                  textAlign: "center",
                  display: "inline-block",
                }}
              >
                {formatTempo(tempo)}x
              </span>
              <TempoButton delta={0.1} topLabel="+" bottomLabel="=" />
            </div>
            <button
              onClick={() => setLatencyCorrectionMs(latencyCorrectionMs - 100)}
            >
              -lat
            </button>
            <span style={{ fontFamily: "monospace" }}>
              {`${
                Math.sign(latencyCorrectionMs / 1000) >= 0 ? "+" : "-"
              }${Math.abs(latencyCorrectionMs / 1000)
                .toFixed(2)
                .charAt(0)}.${Math.abs(latencyCorrectionMs / 1000)
                .toFixed(2)
                .charAt(2)}`}
              s
            </span>
            <button
              onClick={() => setLatencyCorrectionMs(latencyCorrectionMs + 100)}
            >
              lat+
            </button>

            <VolumeSlider
              onChange={(e) => {
                handleVolumeChange(e.target.value);
              }}
              handleReset={(e) => {
                handleVolumeChange(100);
                e.preventDefault();
                e.stopPropagation();
              }}
              value={volume}
            />
            <a
              style={{
                color: canDownload ? "var(--neutral4)" : "var(--neutral6)",
                margin: "0px 20px",
                cursor: canDownload ? "pointer" : "not-allowed",
                pointerEvents: canDownload ? "auto" : "none",
                opacity: canDownload ? 1 : 0.5,
              }}
              href={createBlobUrl()}
              download={getDownloadFilename()}
              title={
                canDownload ? "Download MIDI file" : "No MIDI file to download"
              }
            >
              <FontAwesomeIcon icon={faDownload} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(withRouter(AppFooter));
