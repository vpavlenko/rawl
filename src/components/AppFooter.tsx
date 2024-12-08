import { faDownload, faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo, useContext } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "./AppContext";
import TimeSlider from "./TimeSlider";

const StyledVolumeSlider = styled.div`
  flex-shrink: 0;
  margin-left: var(--charW2);

  @media screen and (max-width: 600px) {
    display: none;
  }
`;

const StyledAppFooter = styled.div`
  margin: 0;
  flex-shrink: 0;
  display: flex;
  height: 24px;
`;

const AppFooterMain = styled.div`
  flex-grow: 1;
  overflow: auto;
`;

const AppFooterMainInner = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTempoButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #333;
  border: 1px solid #999;
  border-radius: 3px;
  background: linear-gradient(to bottom, #f8f8f8 0%, #e0e0e0 100%);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 0 2px rgba(255, 255, 255, 0.5);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  padding: 2px 0;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.05s ease-in-out;
  font-family:
    Times New Roman,
    serif;

  &:active {
    transform: translateY(1px);
    box-shadow:
      0 0 2px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      inset 0 0 2px rgba(255, 255, 255, 0.5);
  }
`;

const VolumeSlider = memo(
  ({
    onChange,
    handleReset,
    value,
  }: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleReset: (e: React.MouseEvent) => void;
    value: number;
  }) => {
    return (
      <StyledVolumeSlider>
        <span style={{ marginRight: "10px" }}>Vol</span>
        <input
          type="range"
          title="Volume"
          min={0}
          max={150}
          step={1}
          onChange={onChange}
          onDoubleClick={handleReset}
          onContextMenu={handleReset}
          value={value}
        />
      </StyledVolumeSlider>
    );
  },
);

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

  return (
    <StyledAppFooter>
      <AppFooterMain>
        <AppFooterMainInner>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span>
              <button
                onClick={togglePause}
                title={paused ? "Resume (use Space)" : "Pause (use Space)"}
                className="box-button"
                disabled={ejected}
                style={{
                  width: "25px",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "16px",
                  lineHeight: 1,
                }}
              >
                <FontAwesomeIcon icon={paused ? faPlay : faPause} />
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
              <StyledTempoButton
                onClick={() => handleTempoChange(-0.1)}
                title={`Change tempo (Minus key)`}
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
                    _
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      lineHeight: "0.8",
                      fontWeight: "bold",
                    }}
                  >
                    -
                  </span>
                </div>
              </StyledTempoButton>
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
              <StyledTempoButton
                onClick={() => handleTempoChange(0.1)}
                title={`Change tempo (Plus key)`}
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
                    +
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      lineHeight: "0.8",
                      fontWeight: "bold",
                    }}
                  >
                    =
                  </span>
                </div>
              </StyledTempoButton>
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
        </AppFooterMainInner>
      </AppFooterMain>
    </StyledAppFooter>
  );
};

export default memo(withRouter(AppFooter));
