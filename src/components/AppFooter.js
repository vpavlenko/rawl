import React, { memo } from "react";
import downloadImage from "../images/download.png";
import PlayerParams from "./PlayerParams";
import TimeSlider from "./TimeSlider";
import VolumeSlider from "./VolumeSlider";

const AppFooter = ({
  currentSongDurationMs,
  currentSongNumVoices,
  ejected,
  paused,
  showPlayerSettings,
  songUrl,
  tempo,
  voiceNames,
  voiceMask,
  volume,
  handleSetVoiceMask,
  handleTempoChange,
  handleTimeSliderChange,
  handleVolumeChange,
  sequencer,
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
            getCurrentPositionMs={() => {
              if (sequencer && sequencer.getPlayer()) {
                return sequencer.getPlayer().getPositionMs();
              }
              return 0;
            }}
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
            title="Double-click or right-click to reset to 100%."
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
    {showPlayerSettings && false && (
      <div className="AppFooter-settings">
        {sequencer?.getPlayer() ? (
          <PlayerParams
            ejected={ejected}
            tempo={tempo}
            numVoices={currentSongNumVoices}
            voiceMask={voiceMask}
            voiceNames={voiceNames}
            handleTempoChange={handleTempoChange}
            handleSetVoiceMask={handleSetVoiceMask}
            getParameter={sequencer.getPlayer().getParameter}
            setParameter={sequencer.getPlayer().setParameter}
            paramDefs={sequencer.getPlayer().getParamDefs()}
          />
        ) : null}
      </div>
    )}
  </div>
);

export default memo(AppFooter);
