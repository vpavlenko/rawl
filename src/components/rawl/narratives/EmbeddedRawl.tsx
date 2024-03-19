import MIDIFile from "midifile";
import * as React from "react";
import { useEffect, useState } from "react";
import MIDIPlayer from "../../../players/MIDIFilePlayer";
import { DUMMY_CALLBACK } from "../../App";
import STATIC_MIDI_FILES from "../../staticMidiFilles";
import Rawl, { AppStateForRawl } from "../Rawl";
import { ParsingResult } from "../parseMidi";

// given this midi file, we need to load its midi, parse and be ready to insert it into sequencer to play
// the navigation for the player happens under the hood
// the flow from getting a midi link to the drawn rawl should be extracted
//     and to be independent from the playing
// let's go through this flow for an ordinary path

const GET_ZERO = () => 0;

const fetchMidi = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText} ${url}`);
    }
    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);
    const midiFile = new MIDIFile(data);
    return new MIDIPlayer().load(midiFile);
  } catch (e) {
    console.error(e);
  }
};

const EmbeddedRawl: React.FC<{
  staticMidiFileId: number;
  analyses: any;
  rawlState: AppStateForRawl;
}> = ({ staticMidiFileId, analyses, rawlState }) => {
  const { path, link } = STATIC_MIDI_FILES.find(
    ({ idx }) => idx === staticMidiFileId,
  );
  const song = path.split("/").at(-1);
  const analysis = analyses["static/musescore_manual"][song]?.[0];
  const [parsingResult, setParsingResult] = useState<ParsingResult | null>(
    null,
  );

  useEffect(() => {
    const midiUrl = `https://rawl.rocks/midi/musescore_manual/${song}`;
    fetchMidi(midiUrl).then((result) => {
      if (result) {
        setParsingResult(result);
      }
    });
  }, [song]);

  return (
    <div>
      <h3>Embedded Rawl</h3>
      <div>{song}</div>
      <a href={link} target="_blank">
        source
      </a>
      <div>
        <a
          href={`https://rawl.rocks/browse/static/musescore_manual?song=${song}`}
          target="_blank"
        >
          open separately
        </a>
      </div>
      <div style={{ height: "400px", width: "1000px" }}>
        {parsingResult && (
          <Rawl
            parsingResult={parsingResult}
            getCurrentPositionMs={GET_ZERO}
            savedAnalysis={analysis}
            saveAnalysis={null}
            showAnalysisBox={false}
            seek={DUMMY_CALLBACK}
            registerSeekCallback={DUMMY_CALLBACK}
            artist={song}
            song={""}
            chordChartLayout={"hidden"}
            {...rawlState}
          />
        )}
      </div>
    </div>
  );
};
export default EmbeddedRawl;
