import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { PianoLegend } from "../PianoLegend";
import { Corpus } from "../analysis";
import About, { Email } from "./About";
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
import Rhythm from "./Rhythm";
import Solo from "./Solo";
import Styles from "./Styles";
import Texture from "./Texture";
import ThicknessOfVoicing from "./ThicknessOfVoicing";
import VoiceLeading from "./VoiceLeading";

const CHAPTERS: { title: string; component: Chapter; hasContent?: boolean }[] =
  [
    { title: "About", component: About, hasContent: true },
    {
      title: "Chords in a Major Key",
      component: ChordsInMajor,
      hasContent: true,
    },
    { title: "Chords in a Minor Key", component: ChordsInMinor },
    { title: "Thickness of Voicing", component: ThicknessOfVoicing },
    { title: "Bass Lines", component: BassLines },
    { title: "Phrases", component: Phrases },
    { title: "Texture", component: Texture },
    { title: "Rhythm", component: Rhythm },
    { title: "Voice-Leading", component: VoiceLeading },
    { title: "Functionality", component: Functionality },
    { title: "Applied Chords", component: AppliedChords },
    { title: "Modes", component: Modes },
    { title: "Chromatic Chords", component: ChromaticChords },
    { title: "Modulation", component: Modulation },
    { title: "bIII, bVI, bVII in Major", component: Pentatonic },
    { title: "Blues", component: Blues },
    { title: "Chord-Scale Theory", component: ChordScaleTheory },
    { title: "Jazz", component: Jazz },
    { title: "Solo", component: Solo },
    { title: "Styles", component: Styles },
  ];

export type Chapter = React.FC<{ sequencer: any; analyses: Corpus }>;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
  gap: 40px;
`;

export const LinkForSeparateTab: React.FC<{ href: string; text: string }> = ({
  href,
  text,
}) => (
  <a href={href} target="_blank">
    {text}&nbsp;&nbsp;
    <FontAwesomeIcon
      icon={faArrowUpRightFromSquare}
      style={{ width: "10px" }}
    />
  </a>
);
export const SongLink = ({ artist, song }) => (
  <LinkForSeparateTab
    href={`/browse/${artist}?song=${song}`}
    text={`${artist.slice(5)} - ${song.slice(0, -4)}`}
  />
);

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
        <SongLink artist={artist} song={song} />
      )}
    </>
  );
};

const Course = ({
  chapter,
  sequencer,
  analyses,
}: {
  chapter: number;
  sequencer: any;
  analyses: Corpus;
}) => {
  if (!(chapter >= 0 && chapter < CHAPTERS.length)) {
    chapter = 1;
  }
  const {
    component: Component,
    title,
    hasContent,
  } = chapter >= 0 && chapter < CHAPTERS.length && CHAPTERS[chapter];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "250px auto",
        columnGap: "50px",
      }}
    >
      <div style={{ marginTop: 20, marginLeft: 15 }}>
        <h3>Western Popular Harmony and Arrangement as Seen in 12 Colors</h3>
        {CHAPTERS.map(({ title }, index) => (
          <div key={title} style={{ margin: 0, paddingTop: 10 }}>
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
        {!hasContent && (
          <div style={{ color: "#999999" }}>
            This chapter is a stub. I assembled some examples to demonstrate
            concepts, but I haven't yet written the narrative. If you want me to
            demo it to you when it's done, reach out to <Email />
          </div>
        )}
        <h2>{title}</h2>
        {Component && <Component sequencer={sequencer} analyses={analyses} />}
      </div>
    </div>
  );
};

export default Course;
