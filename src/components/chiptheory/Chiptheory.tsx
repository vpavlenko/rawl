import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ANALYSIS_STUB,
  Analysis,
  AnalysisBox,
  AnalysisGrid,
  Cursor,
  PitchClass,
  RESOLUTION_MS,
  TWELVE_TONE_COLORS,
  advanceAnalysis,
  romanNumeralToChromaticDegree,
} from "./Analysis";
import { MeasuresAndBeats, calculateMeasuresAndBeats } from "./helpers";
import {
  NES_APU_NOTE_ESTIMATIONS,
  PAUSE,
  nesApuNoteEstimation,
} from "./nesApuNoteEstimations";

type OscType = "pulse" | "triangle" | "noise";
export type Voice = "pulse1" | "pulse2" | "triangle" | "noise" | "under cursor";

function findNoteWithClosestPeriod(
  period: number,
  oscType: OscType,
): nesApuNoteEstimation {
  if (period === -1) {
    return PAUSE;
  }
  if (oscType === "noise") {
    const noise = period % 4;
    return {
      name: `${noise}_`, // pause
      midiNumber: noise + 90,
      frequency: 0,
      pianoNumber: null,
      apuIndex: null,
      pulsePeriod: null,
      pulseFrequency: null,
      pulseTuningError: null,
      trianglePeriod: null,
      triangleFrequency: null,
      triangleTuningError: null,
    };
  }
  let closestNote: nesApuNoteEstimation | null = null;
  let smallestDifference = Infinity;

  for (const note of NES_APU_NOTE_ESTIMATIONS) {
    const currentPeriod =
      oscType === "pulse"
        ? Number(note.pulsePeriod)
        : Number(note.trianglePeriod);
    if (currentPeriod == null) continue;

    const diff = Math.abs(period - currentPeriod);

    if (diff < smallestDifference) {
      smallestDifference = diff;
      closestNote = note;
    }
  }

  return closestNote!;
}

export type Note = {
  note: {
    midiNumber: number;
    name: string;
  };
  span: [number, number];
  chipState: any;
};

const calculateNotesFromPeriods = (periods, oscType) => {
  if (periods === undefined) return [];

  const notes: Note[] = [];
  let timeInSeconds = 0;
  const stepInSeconds = RESOLUTION_MS;

  for (const period of periods) {
    const newNoteEstimation = findNoteWithClosestPeriod(period, oscType);
    const lastNote = notes[notes.length - 1];
    if (
      notes.length === 0 ||
      lastNote.note.midiNumber !== newNoteEstimation.midiNumber
    ) {
      if (notes.length > 0) {
        lastNote.span[1] = timeInSeconds;
      }
      notes.push({
        note: {
          midiNumber: period === -1 ? -1 : newNoteEstimation.midiNumber,
          name: newNoteEstimation.name,
        },
        span: [timeInSeconds, 0],
        chipState: { period: period },
      });
    }

    timeInSeconds += stepInSeconds;
  }
  if (notes.length > 0) {
    notes[notes.length - 1].span[1] = timeInSeconds;
  }

  return notes.filter((note) => note.note.midiNumber !== -1);
};

export const secondsToX = (seconds) => seconds * 70;
const isNoteCurrentlyPlayed = (note, positionMs) => {
  const positionSeconds = positionMs / 1000;
  return note.span[0] <= positionSeconds && positionSeconds <= note.span[1];
};

// This is used when tonal context isn't set yet.
const VOICE_TO_COLOR: { [key in Voice]: string } = {
  pulse1: "#26577C",
  pulse2: "#AE445A",
  triangle: "#63995a",
  noise: "white",
  "under cursor": "under cursor",
};

const getNoteColor = (voice: Voice, midiNumber, analysis): string => {
  if (voice === "noise") {
    return "black";
  }

  if (analysis.tonic === null) {
    return VOICE_TO_COLOR[voice];
  }

  return TWELVE_TONE_COLORS[(midiNumber - analysis.tonic) % 12];
};

const getChordNote = (
  note: Note,
  tonic: PitchClass | null,
  measures: number[] | null,
  romanNumerals?: string,
): string => {
  if (note.span[1] - note.span[0] < 0.1) return "";
  const noteMiddle = (note.span[0] + note.span[1]) / 2;
  if (!measures) return "";
  const measureIndex = measures.findIndex((time) => time >= noteMiddle);
  if (measureIndex === -1) return "";

  const romanNumeral = romanNumerals?.split(" ")?.[measureIndex - 1];
  const rootChromaticScaleDegree = romanNumeralToChromaticDegree(romanNumeral);
  if (rootChromaticScaleDegree === -1) return "";

  return ["r", "♭9", "2", "m", "3", "4", "T", "5", "♭6", "6", "7", "△"][
    (((note.note.midiNumber - tonic) % 12) + 12 - rootChromaticScaleDegree) % 12
  ];
};

const getNoteRectangles = (
  notes: Note[],
  voice: Voice,
  isActiveVoice: boolean,
  analysis: Analysis,
  midiNumberToY: (number: number) => number,
  noteHeight: number,
  handleNoteClick = (note: Note) => {},
  measures: number[] = null,
) => {
  return notes.map((note) => {
    const top = midiNumberToY(note.note.midiNumber);
    const left = secondsToX(note.span[0]);
    const color = getNoteColor(voice, note.note.midiNumber, analysis);
    const chordNote = getChordNote(
      note,
      analysis.tonic,
      measures,
      analysis.romanNumerals,
    );
    const noteName = (
      <span
        className="noteText"
        style={{
          position: "relative",
          top: "0px",
          // left: "1px",
          fontSize: `${Math.min(noteHeight + 2, 14)}px`,
          lineHeight: `${Math.min(noteHeight + 2, 14)}px`,
          fontFamily: "Helvetica, sans-serif",
          fontWeight: 700,
          // color: "#fefefe",
          color: ["blue", "red"].indexOf(color) !== -1 ? "white" : "black",
          // backgroundColor: "black",
          // padding: "5px",
          // borderRadius: "100%",

          // textShadow: "0px 0px 3px rgba(0, 0, 0, 1)",

          // backgroundColor: "rgba(0, 0, 0, 0.5)",
          // padding: "0px 10px",

          // background: "rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* {note.note.name.slice(0, -1)} */}
        {chordNote}
      </span>
    );

    return (
      <div
        className={"noteRectangleTonal"}
        // className={analysis.mode && "noteRectangleTonal"}
        style={{
          position: "absolute",
          height: `${noteHeight}px`,
          width: secondsToX(note.span[1]) - secondsToX(note.span[0]),
          backgroundColor: color,
          top,
          left,
          pointerEvents: voice === "under cursor" ? "none" : "auto",
          // borderTopLeftRadius: voice === "pulse1" ? "100%" : 0,
          boxShadow: voice === "triangle" ? `${color} 0px 0px 10px 0px` : "",
          // borderTop: voice === "pulse1" ? "1px dotted white" : "",
          borderRadius: voice === "pulse1" ? "10px" : "",
          // borderBottomLeftRadius: voice === "triangle" ? "100%" : 0,
          cursor: "pointer",
          zIndex: 10,
          opacity: isActiveVoice ? 0.8 : 0.1,
          display: "grid",
          placeItems: "center",
          ...(voice === "under cursor"
            ? {
                boxShadow: "white 0px 1px",
                boxSizing: "border-box",
                backgroundColor: "transparent",
              }
            : {}),
        }}
        onClick={() => handleNoteClick(note)}
      >
        {voice !== "under cursor" && chordNote && noteName}
      </div>
    );
  });
};

const findCurrentlyPlayedNotes = (notes, positionMs) => {
  const result = [];
  for (const note of notes) {
    if (isNoteCurrentlyPlayed(note, positionMs)) {
      result.push(note);
    }
  }
  return result;
};

const getMidiRange = (
  notes: Note[],
): { minMidiNumber: number; maxMidiNumber: number } => {
  let minMidiNumber = +Infinity;
  let maxMidiNumber = -Infinity;
  for (const note of notes) {
    const { midiNumber } = note.note;
    if (midiNumber < minMidiNumber) {
      minMidiNumber = midiNumber;
    }
    if (midiNumber > maxMidiNumber) {
      maxMidiNumber = midiNumber;
    }
  }
  return { minMidiNumber, maxMidiNumber };
};

const Chiptheory = ({
  chipStateDump,
  getCurrentPositionMs,
  savedAnalysis,
  saveAnalysis,
  voiceMask,
  analysisEnabled,
}) => {
  const [analysis, setAnalysis] = useState<Analysis>(ANALYSIS_STUB);

  useEffect(() => {
    if (savedAnalysis) {
      setAnalysis(savedAnalysis);
    } else {
      setAnalysis(ANALYSIS_STUB);
    }
  }, [savedAnalysis]);

  const [selectedDownbeat, setSelectedDownbeat] = useState<number | null>(null);

  const analysisRef = useRef(analysis);
  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);

  const selectedDownbeatRef = useRef(selectedDownbeat);
  useEffect(() => {
    selectedDownbeatRef.current = selectedDownbeat;
  }, [selectedDownbeat]);

  const handleNoteClick = (note) =>
    advanceAnalysis(
      note,
      selectedDownbeatRef.current,
      setSelectedDownbeat,
      analysisRef.current,
      saveAnalysis,
      setAnalysis,
    );

  const notes = useMemo(() => {
    return {
      p1: calculateNotesFromPeriods(chipStateDump.p1, "pulse"),
      p2: calculateNotesFromPeriods(chipStateDump.p2, "pulse"),
      t: calculateNotesFromPeriods(chipStateDump.t, "triangle"),
      n: calculateNotesFromPeriods(chipStateDump.n, "noise"),
    };
  }, [chipStateDump]);

  const allNotes = useMemo(
    () => [...notes.t, ...notes.p1, ...notes.p2], // [...notes.n]
    [chipStateDump],
  );

  const [measuresAndBeats, setMeasuresAndBeats] = useState<MeasuresAndBeats>({
    measures: [],
    beats: [],
  });
  useEffect(
    () => setMeasuresAndBeats(calculateMeasuresAndBeats(analysis, allNotes)),
    [analysis, allNotes],
  );

  const { minMidiNumber, maxMidiNumber } = useMemo(
    () => getMidiRange([...notes.t, ...notes.p1, ...notes.p2]),
    [notes],
  );

  const [divHeight, setDivHeight] = useState(0);
  const divRef = useRef(null);
  useEffect(() => {
    const updateHeight = () => {
      if (divRef.current) {
        setDivHeight(divRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  useEffect(() => {
    divRef.current.scrollLeft = 0;
  }, [chipStateDump]);

  const noteHeight = divHeight / (maxMidiNumber - minMidiNumber + 7);
  const midiNumberToY = useMemo(
    () => (midiNumber) =>
      divHeight - (midiNumber - minMidiNumber + 4) * noteHeight,
    [noteHeight],
  );

  const noteRectangles = useMemo(() => {
    return [
      ...getNoteRectangles(
        notes.p1,
        "pulse1",
        voiceMask[0],
        analysis,
        midiNumberToY,
        noteHeight,
        handleNoteClick,
        measuresAndBeats.measures,
      ),
      ...getNoteRectangles(
        notes.p2,
        "pulse2",
        voiceMask[1],
        analysis,
        midiNumberToY,
        noteHeight,
        handleNoteClick,
        measuresAndBeats.measures,
      ),
      ...getNoteRectangles(
        notes.t,
        "triangle",
        voiceMask[2],
        analysis,
        midiNumberToY,
        noteHeight,
        handleNoteClick,
        measuresAndBeats.measures,
      ),
      // ...getNoteRectangles(
      //   notes.n,
      //   "noise",
      //   analysis,
      //   midiNumberToY,
      //   noteHeight,
      //   handleNoteClick,
      // ),
    ];
  }, [notes, analysis, measuresAndBeats, noteHeight, voiceMask]);

  const [positionMs, setPositionMs] = useState(0);
  const currentlyPlayedRectangles = getNoteRectangles(
    findCurrentlyPlayedNotes(allNotes, positionMs),
    "under cursor",
    true,
    analysis,
    midiNumberToY,
    noteHeight,
  );

  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running) {
        return;
      }

      setPositionMs(getCurrentPositionMs() - 70); // A dirty hack, I don't know why it gets ahead of playback.
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
    };
  }, []);

  return (
    <div className="App-main-content-and-settings">
      <div
        style={{
          width: "100%",
          height: "100%",
          marginTop: "19px",
          padding: 0,
          backgroundColor: "black",
        }}
      >
        <div
          ref={divRef}
          style={{
            margin: 0,
            padding: 0,
            position: "relative",
            overflowX: "scroll",
            overflowY: "hidden",
            width: "100%",
            height: "100%",
            backgroundColor: "black",
          }}
        >
          {noteRectangles}
          {currentlyPlayedRectangles}
          <Cursor style={{ left: secondsToX(positionMs / 1000) }} />
          <AnalysisGrid
            analysis={analysis}
            allNotes={allNotes}
            measuresAndBeats={measuresAndBeats}
            midiNumberToY={midiNumberToY}
            noteHeight={noteHeight}
            selectedDownbeat={selectedDownbeat}
            selectDownbeat={setSelectedDownbeat}
          />
        </div>
      </div>
      {analysisEnabled && (
        <AnalysisBox
          analysis={analysis}
          saveAnalysis={saveAnalysis}
          setAnalysis={setAnalysis}
          selectedDownbeat={selectedDownbeat}
          selectDownbeat={setSelectedDownbeat}
        />
      )}
    </div>
  );
};

export default Chiptheory;
