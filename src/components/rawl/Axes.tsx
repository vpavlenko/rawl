import MidiWriter from "midi-writer-js";
import * as React from "react";
import styled from "styled-components";

const Tag = ({ name }: { name: string }) => {
  return <span>{name.split(":")[1]}</span>;
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
    <div>
      <div>{title}</div>
      <AxisContent>{children}</AxisContent>
    </div>
  );
};

// We should make a language to store clean examples for each tag
// Each example should be a pattern from tonic that's playable and visualisable
// If we convert it to midi, then we automatically get "sound equals visuals"
// So we need a DSL to quickly draft MIDI

const Axes = ({ sequencer }) => {
  return (
    <div>
      <h3>Axes of Western popular harmony, as seen in 12 colors</h3>
      <Axis title="1. Major/minor">
        <Tag name="scale:major" />
        <Tag name="scale:minor" />
      </Axis>
      <Axis title="2. Thickness of voicing">
        <Tag name="voicing:root" />
        <Tag name="voicing:power_chords" />
        <Tag name="voicing:triads" />
        <Tag name="voicing:diatonic_sevenths" />
      </Axis>
      <div
        onClick={() => {
          const track = new MidiWriter.Track();
          track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
          const cMajorChord = new MidiWriter.NoteEvent({
            pitch: ["C4", "E4", "G4"],
            duration: "1",
          });
          track.addEvent(cMajorChord);

          // Add a G Major chord
          const gMajorChord = new MidiWriter.NoteEvent({
            pitch: ["G4", "B4", "D5"],
            duration: "1",
          });
          track.addEvent(gMajorChord);

          const binaryData = new MidiWriter.Writer(track).buildFile();
          sequencer.playSongFile("custom.mid", binaryData);
        }}
      >
        [play]
      </div>
    </div>
  );
};

export default Axes;
