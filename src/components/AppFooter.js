import React, { memo, useCallback } from "react";
import downloadImage from "../images/download.png";
import linkImage from "../images/link.png";
import { pathToLinks } from "../util";
import PlayerParams from "./PlayerParams";
import TimeSlider from "./TimeSlider";
import VolumeSlider from "./VolumeSlider";

export default memo(AppFooter);
function AppFooter(props) {
  const {
    // this.state.
    currentSongDurationMs,
    currentSongNumSubtunes,
    currentSongNumVoices,
    currentSongSubtune,
    ejected,
    faves,
    imageUrl,
    infoTexts,
    paused,
    repeat,
    shuffle,
    showPlayerSettings,
    songUrl,
    subtitle,
    tempo,
    title,
    voiceNames,
    voiceMask,
    volume,

    // this.
    getCurrentSongLink,
    handleCycleRepeat,
    handleCycleShuffle,
    handleSetVoiceMask,
    handleTempoChange,
    handleTimeSliderChange,
    handleToggleFavorite,
    handleVolumeChange,
    nextSong,
    nextSubtune,
    prevSong,
    prevSubtune,
    sequencer,
    toggleInfo,
    togglePause,
    toggleSettings,
  } = props;

  const pathLinks = pathToLinks(songUrl);
  const handleToggleInfo = useCallback(
    (e) => {
      e.preventDefault();
      toggleInfo();
    },
    [toggleInfo],
  );

  return (
    <div className="AppFooter">
      <div className="AppFooter-main">
        <div className="AppFooter-main-inner">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <span style={{ whiteSpace: "nowrap" }}>
              <button
                onClick={togglePause}
                title={paused ? "Resume" : "Pause"}
                className="box-button"
                disabled={ejected}
              >
                {paused ? " ► " : " ⏸ "}
              </button>{" "}
              Tune {currentSongSubtune + 1} of {currentSongNumSubtunes}{" "}
              <button
                className="box-button"
                disabled={ejected}
                onClick={prevSubtune}
              >
                &lt;
              </button>{" "}
              <button
                className="box-button"
                disabled={ejected}
                onClick={nextSubtune}
              >
                &gt;
              </button>
            </span>
            <TimeSlider
              paused={paused}
              currentSongDurationMs={currentSongDurationMs}
              getCurrentPositionMs={() => {
                // TODO: reevaluate this approach
                if (sequencer && sequencer.getPlayer()) {
                  return sequencer.getPlayer().getPositionMs();
                }
                return 0;
              }}
              onChange={handleTimeSliderChange}
            />
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
          </div>
          {!ejected && (
            <div className="SongDetails">
              <div className="SongDetails-title">
                {/* <a
                  style={{ color: "var(--neutral4)" }}
                  href={getCurrentSongLink()}
                > */}
                {title}{" "}
                <img
                  alt="Copy link"
                  src={linkImage}
                  style={{ verticalAlign: "bottom" }}
                />
                {/* </a> */}{" "}
                <a style={{ color: "var(--neutral4)" }} href={songUrl}>
                  <img
                    alt="Download"
                    src={downloadImage}
                    style={{ verticalAlign: "bottom" }}
                  />
                </a>{" "}
                {infoTexts.length > 0 && (
                  <a onClick={handleToggleInfo} href="#">
                    тхт
                  </a>
                )}
                <span style={{ marginLeft: "20px" }}>{subtitle}</span>
                {/* <div className="SongDetails-filepath">{pathLinks}</div> */}
              </div>
            </div>
          )}
        </div>
      </div>
      {showPlayerSettings && (
        <div className="AppFooter-settings">
          {sequencer.getPlayer() ? (
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
          ) : (
            <div>(No active player)</div>
          )}
        </div>
      )}
      {imageUrl && (
        <img alt="Cover art" className="AppFooter-art" src={imageUrl} />
      )}
    </div>
  );
}
