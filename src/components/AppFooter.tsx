import React, { memo } from "react";
import downloadImage from "../images/download.png";
import TimeSlider from "./TimeSlider";
import VolumeSlider from "./VolumeSlider";

const AppFooter: React.FC<{
  currentSongDurationMs: number;
  ejected: boolean;
  paused: boolean;
  songUrl: string;
  volume: number;
  handleTimeSliderChange: any;
  handleVolumeChange: any;
  getCurrentPositionMs: any;
  togglePause: any;
  latencyCorrectionMs: number;
  setLatencyCorrectionMs: (latency: number) => void;
}> = ({
  currentSongDurationMs,
  ejected,
  paused,
  songUrl,
  volume,
  handleTimeSliderChange,
  handleVolumeChange,
  getCurrentPositionMs,
  togglePause,
  latencyCorrectionMs,
  setLatencyCorrectionMs,
}) => (
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
            href={songUrl}
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

export default memo(AppFooter);
