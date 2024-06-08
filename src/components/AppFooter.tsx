import React, { memo } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import downloadImage from "../images/download.png";
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
}) => {
  const createBlobUrl = () => {
    const blob = new Blob([fileToDownload], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    return url;
  };
  const { pathname } = location;

  const segments = pathname.split("/").filter(Boolean);

  let lastSegment = segments.length > 0 ? segments[segments.length - 1] : "";
  if (!lastSegment.endsWith(".mid")) {
    lastSegment = `${lastSegment}.mid`;
  }

  return (
    <div className="AppFooter" style={{ height: 24 }}>
      <div className="AppFooter-main">
        <div className="AppFooter-main-inner">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <span style={{ whiteSpace: "nowrap" }}>
              <button
                onClick={togglePause}
                title={paused ? "Resume (use Space)" : "Pause (use Space)"}
                className="box-button"
                disabled={ejected}
              >
                {paused ? " ► " : " ⏸ "}
              </button>{" "}
            </span>
            <TimeSlider
              paused={paused}
              currentSongDurationMs={currentSongDurationMs}
              getCurrentPositionMs={getCurrentPositionMs}
              onChange={handleTimeSliderChange}
            />
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
              style={{ color: "var(--neutral4)", margin: "0px 20px" }}
              href={createBlobUrl()}
              download={lastSegment}
            >
              <img
                alt="Download"
                src={downloadImage}
                style={{ verticalAlign: "bottom" }}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(withRouter(AppFooter));
