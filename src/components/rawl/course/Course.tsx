import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { PianoLegend } from "../PianoLegend";
import Annotation from "./Annotation";
import ChordsInMajor from "./ChordsInMajor";
import ChordsInMinor from "./ChordsInMinor";
import TheRest from "./TheRest";

const CHAPTERS = [
  { title: "Chords in a major key", component: ChordsInMajor },
  { title: "Annotation", component: Annotation },
  { title: "Chords in a minor key", component: ChordsInMinor },
  { title: "The rest", component: TheRest },
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
    chapter = 0;
  }
  const Component =
    chapter >= 0 && chapter < CHAPTERS.length && CHAPTERS[chapter].component;
  return (
    <div
      className="course"
      style={{
        display: "grid",
        gridTemplateColumns: "300px auto",
        columnGap: "50px",
      }}
    >
      <div>
        <h3>Western pop harmony as seen in 12 colors</h3>
        {CHAPTERS.map(({ title }, index) => (
          <div>
            <Link to={`/course/${index}`}>{title}</Link>
          </div>
        ))}
        <div
          key="piano-legend"
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            zIndex: 10000000,
          }}
        >
          <PianoLegend />
        </div>
      </div>
      <div style={{ width: "600px" }}>
        {Component && <Component sequencer={sequencer} />}
      </div>
    </div>
  );
};

export default Course;
