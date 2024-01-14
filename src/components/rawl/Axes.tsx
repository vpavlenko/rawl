import MidiWriter from "midi-writer-js";
import * as React from "react";
import styled from "styled-components";
import MIDI_PREVIEWS from "./AxesMidiPreviews";
import { Voice } from "./SystemLayout";
import { PitchClass } from "./analysis";

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
      onClick={async () => {
        const track = new MidiWriter.Track();
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
        notes.split(" ").map((chord) =>
          track.addEvent(
            new MidiWriter.NoteEvent({
              pitch: chord.split("-"),
              duration: "2",
            }),
          ),
        );
        const binaryData = new MidiWriter.Writer(track).buildFile();
        const result = await sequencer.playSongFile("custom.mid", binaryData);
        MIDI_PREVIEWS[notes] = result;
        console.log(JSON.stringify(MIDI_PREVIEWS));
      }}
    >
      {name.split(":")[1]}
      {MIDI_PREVIEWS[notes] && (
        <Voice {...VOICE_PARAMS} {...MIDI_PREVIEWS[notes]} />
      )}
    </span>
  );
};

const AxisContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 50px;
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
  analysis: {
    modulations: {},
    tonic: 0 as PitchClass,
    comment: "",
    tags: [],
    form: [],
    phrasePatch: [],
  },
  showVelocity: false,
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
          notes="C2-E3-G3-C4 A1-E3-A3-C4 E2-E3-G3-B3 F2-F3-A3-C4 D2-F3-A3-D4 G2-G3-B3-D4 C2-G3-C4-E4"
        />
        <Tag
          sequencer={sequencer}
          name="scale:minor"
          notes="C2-Eb3-G3-C4 Ab1-Eb3-Ab3-C4 Bb1-F3-Bb3-D3 Eb2-Eb3-G3-Bb3 F2-F3-Ab3-C4 G2-G3-B3-D4 C2-G3-C4-Eb4"
        />
      </Axis>
      <Axis title="2. Thickness of voicing">
        <Tag sequencer={sequencer} name="voicing:root" notes="C3 F2 G2 C3" />
        <Tag
          sequencer={sequencer}
          name="voicing:power_chords"
          notes="C3-G3 F2-C3 G2-D3 C3-G3"
        />
        <Tag sequencer={sequencer} name="voicing:triads" />
        <Tag sequencer={sequencer} name="voicing:diatonic_sevenths" />
      </Axis>
    </div>
  );
};

export default Axes;
