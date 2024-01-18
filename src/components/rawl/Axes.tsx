import MidiWriter from "midi-writer-js";
import * as React from "react";
import styled from "styled-components";
import { TAGS } from "./AnalysisBox";
import MIDI_PREVIEWS from "./AxesMidiPreviews";
import { PianoLegend } from "./PianoLegend";
import { Voice } from "./SystemLayout";
import { PitchClass } from "./analysis";

export const NoteSnippet = ({ notes, sequencer }) => {
  return (
    notes && (
      <div
        style={{ cursor: "pointer" }}
        onClick={async () => {
          const track = new MidiWriter.Track();
          track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
          let duration = "2";
          let notesToPlay = notes;
          if (notes.indexOf(",") !== -1) {
            [duration, notesToPlay] = notes.split(",");
          }
          notesToPlay.split(" ").map((chord) =>
            track.addEvent(
              new MidiWriter.NoteEvent({
                pitch: chord.split("-"),
                duration,
              }),
            ),
          );
          const binaryData = new MidiWriter.Writer(track).buildFile();
          const result = await sequencer.playSongFile("custom.mid", binaryData);
          if (MIDI_PREVIEWS[notes]) {
            return;
          }
          // result.notes[0].forEach((note) => delete note.chipState);
          MIDI_PREVIEWS[notes] = result;
          console.log(JSON.stringify(MIDI_PREVIEWS));
        }}
      >
        {(MIDI_PREVIEWS[notes] && (
          <Voice
            {...VOICE_PARAMS}
            {...MIDI_PREVIEWS[notes]}
            mouseHandlers={{
              handleNoteClick: null,
              handleMouseEnter: (note) => {
                sequencer.player.midiFilePlayer.synth.noteOn(
                  note.chipState.on.channel,
                  note.chipState.on.param1,
                  note.chipState.on.param2,
                );
                setTimeout(
                  () =>
                    sequencer.player.midiFilePlayer.synth.noteOff(
                      note.chipState.off.channel,
                      note.chipState.off.param1,
                    ),
                  (note.span[1] - note.span[0]) * 1000,
                );
              },
              handleMouseLeave: () => {},
              hoveredNote: null,
              hoveredAltKey: false,
              systemClickHandler: () => {},
            }}
          />
        )) ||
          "play"}
      </div>
    )
  );
};

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
    <span>
      <a href={`/tags/${name}`} target="_blank">
        {name.split(":")[1]}
      </a>
      <NoteSnippet notes={notes} sequencer={sequencer} />
    </span>
  );
};

const TagGroup = ({ group, sequencer }) => (
  <Axis title={group}>
    {TAGS.filter((tag) => tag.startsWith(`${group}:`)).map((tag) => (
      <Tag sequencer={sequencer} name={tag} />
    ))}
  </Axis>
);

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

const Axes = ({ sequencer }) => {
  return (
    <div>
      <h2>Axes of Western popular harmony, as seen in 12 colors</h2>
      <PianoLegend hoverable={false} />
      <Axis title="1. Major/minor">
        <Tag
          name="scale:major"
          sequencer={sequencer}
          notes="C2-C3-E3-G3-C4 D2-D3-F3-A3-D4 E2-E3-G3-B3-E4 F2-F3-A3-C4-F4 G2-G3-B3-D4-G4 A2-A3-C4-E4-A4 G2-G3-B3-D4-B4 C3-C4-E4-G4-C5"
        />
        <Tag
          sequencer={sequencer}
          name="scale:minor"
          notes="C2-C3-Eb3-G3-C4 Bb1-Bb2-D3-F3-D4 Eb2-Eb3-G3-Bb3-Eb4 F2-F3-Ab3-C4-F4 G2-G3-Bb3-D4-G4 Ab2-Ab3-C4-Eb4-Ab4 G2-G3-B3-D4-B4 C3-C4-Eb4-G4-C5"
        />
        <Tag
          sequencer={sequencer}
          name="scale:natural_minor"
          notes="C2-C3-Eb3-G3-C4 Bb1-Bb2-D3-F3-D4 Eb2-Eb3-G3-Bb3-Eb4 F2-F3-Ab3-C4-F4 G2-G3-Bb3-D4-G4 Ab2-Ab3-C4-Eb4-Ab4 Bb2-Bb3-D4-F4-Bb4 C3-C4-Eb4-G4-C5"
        />
        <Tag
          sequencer={sequencer}
          name="scale:dorian"
          notes="C2-C3-Eb3-G3-Eb4 F2-F3-A3-C4-F4 C2-C3-Eb3-G3-G4 F2-F3-A3-C4-A4 C2-C3-Eb3-G3-C5"
        />
        <Tag
          sequencer={sequencer}
          name="scale:pentatonic"
          notes="8,C3 Eb3 F3 F#3 G3 Bb3 C4 Bb3 G3 F#3 F3 Eb3 C3"
        />
        <Tag sequencer={sequencer} name="scale:transposed_pentatonic" />
        <Tag sequencer={sequencer} name="scale:blues" />
        <Tag sequencer={sequencer} name="scale:mixolydian" />
        <Tag sequencer={sequencer} name="scale:major_b6" />
      </Axis>
      <Axis title="2. Thickness of voicing">
        <Tag
          sequencer={sequencer}
          name="voicing:root"
          notes="C4 G3 A3 E3 F3 C3 F3 G3"
        />
        <Tag
          sequencer={sequencer}
          name="voicing:power_chords"
          notes="C4-G4 G3-D4 A3-E4 E3-B3 F3-C4 C3-G3 F3-C4 G3-D4"
        />
        <Tag
          sequencer={sequencer}
          name="voicing:triads"
          notes="C4-E4-G4 G3-B3-D4 A3-C4-E4 E3-G3-B3 F3-A3-C4 C3-E3-G3 F3-A3-C4 G3-B3-D4"
        />
        <Tag
          sequencer={sequencer}
          name="voicing:diatonic_sevenths"
          notes="C4-E4-G4-B4 G3-B3-D4-F4 A3-C4-E4-G4 E3-G3-B3-D4 F3-A3-C4-E4 C3-E3-G3-B3 F3-A3-C4-E4 G3-B3-D4-F4"
        />
        <Tag
          sequencer={sequencer}
          name="voicing:alterations"
          notes="C4-E4-G4-B4-D5 G3-D4-E4-G4-B4 A3-C4-E4-G4-B4 E3-G3-B3-D4 F3-A3-C4-E4-G4 C3-E3-G3-B3-D4 F3-A3-C4-E4-G4 G3-B3-D4-F4-A4"
        />
        <Tag
          sequencer={sequencer}
          name="voicing:blues"
          notes="C3-E3-G3-Bb3 C3-E3-G3-Bb3 F3-A3-C4-Eb4 C3-E3-G3-Bb3 G3-B3-D4-F4 F3-A3-C4-Eb4 C3-E3-G3-Bb3"
        />
      </Axis>
      <Axis title="3. Tonal stability">
        <Tag
          sequencer={sequencer}
          name="harmony:pure_I-V"
          notes="C3-E3-G3-C4 G2-B2-D3-D4 C3-E3-G3-E4 G2-B2-D3-F4 C3-E3-G3-G4 C3-E3-G3-A4 G2-B2-D3-B4 C3-E3-G3-C5"
        />
        <Tag
          sequencer={sequencer}
          name="harmony:pure_I-IV-V"
          notes="C3-E3-G3-C4 G2-B2-D3-D4 C3-E3-G3-E4 F2-A2-C3-F4 C3-E3-G3-G4 F2-A2-C3-A4 G2-B2-D3-B4 C3-E3-G3-C5"
        />
        <Tag
          sequencer={sequencer}
          name="applied:V/V"
          notes="C3-E3-G3-C4 G2-B2-D3-D4 C3-E3-G3-E4 F3-A3-C4-F4 C3-E3-G3-G4 D3-F#3-A3-A4 G3-B3-D4-B4 C3-E3-G3-C5"
        />
        <Tag
          sequencer={sequencer}
          name="applied:V/vi"
          notes="C3-E3-G3-C4 G2-B2-D3-D4 C3-E3-G3-E4 F3-A3-C4-F4 E3-G#3-B3-G#4 A3-C4-E4-A4 G3-B3-D4-B4 C3-E3-G3-C5"
        />
        <Tag
          name="modulation:up_at_the_end"
          sequencer={sequencer}
          notes="C3-E3-G3-C4 F2-A2-C3-D4 G2-B2-D3-B3 C3-E3-G3-C4 C#3-E#3-G#3-C#4 F#2-A#2-C#3-D#4 G#2-B#2-D#3-B#3 C#3-E#3-G#3-C#4"
        />
        <Tag
          sequencer={sequencer}
          name="modulation:parallel_keys"
          notes="C3-E3-G3-C4 F2-A2-C3-D4 G2-B2-D3-B3 C3-E3-G3-C4 C3-Eb3-G3-C4 F2-Ab2-C3-D4 G2-B2-D3-B3 C3-Eb3-G3-C4"
        />
        <Tag sequencer={sequencer} name="modulation:relative_major" />
        <Tag sequencer={sequencer} name="modulation:contrast" />
        <Tag sequencer={sequencer} name="modulation:often" />
        <Tag sequencer={sequencer} name="modulation:back_down" />
      </Axis>
      <TagGroup group={"bass"} sequencer={sequencer} />
      <TagGroup group={"functionality"} sequencer={sequencer} />
      <TagGroup group={"chord"} sequencer={sequencer} />
      <TagGroup group={"chunks"} sequencer={sequencer} />
      <TagGroup group={"chord-scale"} sequencer={sequencer} />
      <TagGroup group={"rhythm"} sequencer={sequencer} />
      <TagGroup group={"style"} sequencer={sequencer} />
      <TagGroup group={"form"} sequencer={sequencer} />
      <TagGroup group={"tempo"} sequencer={sequencer} />
      <TagGroup group={"melody"} sequencer={sequencer} />
    </div>
  );
};

export default Axes;
