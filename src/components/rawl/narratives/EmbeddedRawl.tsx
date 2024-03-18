import * as React from "react";

// given this midi file, we need to load its midi, parse and be ready to insert it into sequencer to play
// the navigation for the player happens under the hood
// the flow from getting a midi link to the drawn rawl should be extracted
//     and to be independent from the playing
// let's go through this flow for an ordinary path

const EmbeddedRawl: React.FC<{
  file: string;
  analyses: any;
  measures: number[];
}> = ({ file, analyses, measures }) => {
  const [browsePath, song] = file.split("?");
  const analysis = analyses[browsePath]?.[song];
  return (
    <div>
      <h3>Embedded Rawl</h3>
      <div>{file}</div>
      {measures}
      {/* <Rawl
        parsingResult={this.state.parsings[browsePath]}
        getCurrentPositionMs={this.getCurrentPositionMs}
        savedAnalysis={savedAnalysis}
        saveAnalysis={null}
        voiceNames={this.state.voiceNames}
        voiceMask={this.state.voiceMask}
        setVoiceMask={this.handleSetVoiceMask}
        showAnalysisBox={this.state.analysisEnabled}
        seek={(time) => this.seekRelativeInner(time, true)}
        registerSeekCallback={(seekCallback) => this.setState({ seekCallback })}
        synth={this.midiPlayer.midiFilePlayer.synth}
        paused={this.state.paused}
        artist={browsePath}
        song={song}
        exercise={searchParams.get("exercise")}
        sequencer={this.sequencer}
        setEnterFullScreen={(enterFullScreen) =>
          (this.enterFullScreen = enterFullScreen)
        }
        latencyCorrectionMs={this.state.latencyCorrectionMs}
      /> */}
    </div>
  );
};
export default EmbeddedRawl;
