import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { PianoLegend } from "../PianoLegend";
import About from "./About";
import AppliedChords from "./AppliedChords";
import BassLines from "./BassLines";
import Blues from "./Blues";
import ChordScaleTheory from "./ChordScaleTheory";
import ChordsInMajor from "./ChordsInMajor";
import ChordsInMinor from "./ChordsInMinor";
import ChromaticChords from "./ChromaticChords";
import Functionality from "./Functionality";
import Jazz from "./Jazz";
import Modes from "./Modes";
import Modulation from "./Modulation";
import Pentatonic from "./Pentatonic";
import Phrases from "./Phrases";
import Texture from "./Texture";
import TheRest from "./TheRest";
import ThicknessOfVoicing from "./ThicknessOfVoicing";
import Tonic from "./Tonic";

const CHAPTERS = [
  { title: "About", component: About },
  { title: "Chords in a Major Key", component: ChordsInMajor },
  { title: "Chords in a Minor Key", component: ChordsInMinor },
  { title: "Thickness of Voicing", component: ThicknessOfVoicing },
  { title: "Bass Lines", component: BassLines },
  { title: "Tonic", component: Tonic },
  { title: "Phrases", component: Phrases },
  { title: "Texture", component: Texture },
  { title: "Functionality", component: Functionality },
  { title: "Applied Chords", component: AppliedChords },
  { title: "Modes", component: Modes },
  { title: "Chromatic Chords", component: ChromaticChords },
  { title: "Modulation", component: Modulation },
  { title: "Pentatonic", component: Pentatonic },
  { title: "Blues", component: Blues },
  { title: "Chord-Scale Theory", component: ChordScaleTheory },
  { title: "Jazz", component: Jazz },
  { title: "The Rest", component: TheRest },
];

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
  gap: 40px;
`;

export const S = ({ artist, song, exercise = null }) => {
  return (
    <>
      {exercise ? (
        <>
          <a
            href={`/browse/${artist}?song=${song}&exercise=${exercise}`}
            style={{ color: "orange" }}
            target="_blank"
          >
            {artist.slice(5)} - {song.slice(0, -4)}: find the {exercise}
          </a>
        </>
      ) : (
        <a href={`/browse/${artist}?song=${song}`} target="_blank">
          {artist.slice(5)} - {song.slice(0, -4)}
        </a>
      )}
    </>
  );
};

const Course = ({ chapter, sequencer }) => {
  if (!(chapter >= 0 && chapter < CHAPTERS.length)) {
    chapter = 1;
  }
  const { component: Component, title } =
    chapter >= 0 && chapter < CHAPTERS.length && CHAPTERS[chapter];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px auto",
        columnGap: "50px",
      }}
    >
      <div style={{ marginTop: 20, marginLeft: 15 }}>
        <h3>Western Popular Harmony and Arrangement as Seen in 12 Colors</h3>
        {CHAPTERS.map(({ title }, index) => (
          <div style={{ margin: 0, paddingTop: 10 }}>
            {chapter == index ? (
              title
            ) : (
              <Link to={`/course/${index}`}>{title}</Link>
            )}
          </div>
        ))}
        <div
          key="piano-legend"
          style={{
            position: "absolute",
            bottom: 30,
            left: 0,
            zIndex: 10000000,
          }}
        >
          <PianoLegend />
        </div>
      </div>
      <div className="course" style={{ width: "600px" }}>
        <h2>{title}</h2>
        {Component && <Component sequencer={sequencer} />}
      </div>
    </div>
  );
};

export default Course;
