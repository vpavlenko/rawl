import { faDownload, faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo, useContext } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "./AppContext";
import { StyledRangeInput } from "./Slider";
import TimeSlider from "./TimeSlider";

export const FOOTER_HEIGHT = 25;

const StyledVolumeSlider = styled.div`
  flex-shrink: 0;
  width: 10%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 10px;

  &::before {
    content: "Vol";
    margin-right: 10px;
  }

  ${StyledRangeInput} {
    width: 100%;
  }
`;

const StyledAppFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${FOOTER_HEIGHT}px;
  background: var(--background);
  display: flex;
  align-items: center;
  padding: 0;
  z-index: 10000000;
  border-top: 1px solid var(--border);
`;

const AppFooterMain = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; // Prevents flex items from overflowing
`;

const TempoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin: 0 20px;
  flex-direction: row;
`;

const LatencySection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 6.5em;
  flex-shrink: 0;
  margin: 0 20px;
`;

const DownloadButton = styled.a`
  width: 20px;
  flex-shrink: 0;
  text-align: center;
  margin-left: 10px;
`;

const PauseButton = styled.button`
  width: 50px;
  height: ${FOOTER_HEIGHT}px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  line-height: 1;
  margin-right: 10px;
`;

const LatencyButton = styled.button`
  height: ${FOOTER_HEIGHT}px;
`;

const TimeSliderWrapper = styled.div`
  flex: 2;
  min-width: 300px;
  margin: 0 10px;
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
        <PauseButton
          onClick={togglePause}
          title={paused ? "Resume (use Space)" : "Pause (use Space)"}
          disabled={ejected}
        >
          <FontAwesomeIcon icon={paused ? faPlay : faPause} />
        </PauseButton>

        <TimeSliderWrapper>
          <TimeSlider
            paused={paused}
            currentSongDurationMs={currentSongDurationMs}
            getCurrentPositionMs={getCurrentPositionMs}
            onChange={handleTimeSliderChange}
          />
        </TimeSliderWrapper>

        <TempoSection>
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
              // margin: "0 15px",
              fontFamily: "monospace",
              width: "3em",
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
        </TempoSection>

        <LatencySection>
          <LatencyButton
            onClick={() => setLatencyCorrectionMs(latencyCorrectionMs - 100)}
          >
            ▼
          </LatencyButton>
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
          <LatencyButton
            onClick={() => setLatencyCorrectionMs(latencyCorrectionMs + 100)}
          >
            ▲
          </LatencyButton>
        </LatencySection>

        <StyledVolumeSlider>
          <StyledRangeInput
            title="Volume"
            min={0}
            max={150}
            step={1}
            onChange={(e) => handleVolumeChange(e.target.value)}
            onDoubleClick={(e) => {
              handleVolumeChange(100);
              e.preventDefault();
              e.stopPropagation();
            }}
            value={volume}
          />
        </StyledVolumeSlider>

        <DownloadButton
          style={{
            color: canDownload ? "var(--neutral4)" : "var(--neutral6)",
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
        </DownloadButton>
      </AppFooterMain>
    </StyledAppFooter>
  );
};

export default memo(withRouter(AppFooter));
