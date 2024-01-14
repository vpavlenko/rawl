import MidiWriter from "midi-writer-js";
import * as React from "react";
import styled from "styled-components";
import { SecondsSpan } from "./Rawl";
import { Voice } from "./SystemLayout";
import { MeasuresSpan, PitchClass } from "./analysis";

const Tag = ({
  name,
  sequencer,
  notes = "",
}: {
  name: string;
  sequencer: any;
  notes?: string;
}) => {
  return (
    <span
      onClick={() => {
        const track = new MidiWriter.Track();
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
        notes.split(" ").map((chord) =>
          track.addEvent(
            new MidiWriter.NoteEvent({
              pitch: chord.split("-"),
              duration: "4",
            }),
          ),
        );
        const binaryData = new MidiWriter.Writer(track).buildFile();
        sequencer.playSongFile("custom.mid", binaryData);
      }}
    >
      {name.split(":")[1]}
    </span>
  );
};

const AxisContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: flex-start;
`;

const Axis: React.FC<React.PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  return (
    <div style={{ marginTop: "50px" }}>
      <h3>{title}</h3>
      <AxisContent>{children}</AxisContent>
    </div>
  );
};

const VOICE_PARAMS = {
  notes: JSON.parse(
    '[[{"note":{"midiNumber":60},"id":0,"isDrum":false,"span":[0,1]},{"note":{"midiNumber":64},"id":1,"isDrum":false,"span":[0,1]},{"note":{"midiNumber":67},"id":2,"isDrum":false,"span":[0,1]},{"note":{"midiNumber":67},"id":3,"isDrum":false,"span":[1,2]},{"note":{"midiNumber":71},"id":4,"isDrum":false,"span":[1,2]},{"note":{"midiNumber":74},"id":5,"isDrum":false,"span":[1,2]}]]',
  ),
  measuresAndBeats: { measures: [0, 2], beats: [0.5, 1, 1.5] },
  measuresSpan: [1, 2] as MeasuresSpan,
  secondsSpan: [0, 2] as SecondsSpan,
  analysis: {
    modulations: {},
    tonic: 0 as PitchClass,
    comment: "",
    tags: [],
    form: [],
    phrasePatch: [],
  },
  showVelocity: false,
  measures: [0, 2],
  cursor: null,
  phraseStarts: [],
  mouseHandlers: {
    handleNoteClick: () => {},
    handleMouseEnter: () => {},
    handleMouseLeave: () => {},
    hoveredNote: null,
    hoveredAltKey: false,
    systemClickHandler: () => {},
  },
  measureSelection: {
    previouslySelectedMeasure: null,
    selectedMeasure: null,
    selectMeasure: () => {},
  },
  showHeader: false,
  scrollLeft: 0,
  scrollRight: 1000,
  voiceName: "",
  setVoiceMask: () => {},
  voiceIndex: 0,
  voiceMask: [true],
  showTonalGrid: false,
};

const Axes = ({ sequencer, children }) => {
  return (
    <div>
      <h3>Axes of Western popular harmony, as seen in 12 colors</h3>
      <Axis title="1. Major/minor">
        <Tag
          name="scale:major"
          sequencer={sequencer}
          notes="C3-C4-E4-G4 F2-F4-A4-C5 G2-G4-B4-D5 C3-C4-E4-G4"
        />
        <Tag
          sequencer={sequencer}
          name="scale:minor"
          notes="C3-C4-Eb4-G4 F2-F4-Ab4-C5 G2-G4-B4-D5 C3-C4-Eb4-G4"
        />
      </Axis>
      <Axis title="2. Thickness of voicing">
        <Tag sequencer={sequencer} name="voicing:root" />
        <Tag sequencer={sequencer} name="voicing:power_chords" />
        <Tag sequencer={sequencer} name="voicing:triads" />
        <Tag sequencer={sequencer} name="voicing:diatonic_sevenths" />
      </Axis>
      <div>
        <Voice {...VOICE_PARAMS} />
      </div>
      {/* <div>{children}</div> */}
    </div>
  );
};

export default Axes;
