import MIDIFile from "midifile";
import * as React from "react";
import { useEffect, useState } from "react";
import MIDIPlayer from "../../../players/MIDIFilePlayer";
import { DUMMY_CALLBACK } from "../../App";
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
  song: string;
  analyses: any;
  measures: number[];
  rawlState: AppStateForRawl;
}> = ({ song, analyses, measures, rawlState }) => {
  const analysis = analyses["static/musescore_manual"]?.[song][0];
  // analyses['static/musescore_manual']['Bella_Ciao.mid']
  // analyses['static/musescore_manual']['Pirates_of_the_Caribbean_-_Hes_a_Pirate.mid']
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
      {`mm. ${measures[0]}-${measures[1]}`}
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
            {...rawlState}
          />
        )}
      </div>
    </div>
  );
};
export default EmbeddedRawl;
