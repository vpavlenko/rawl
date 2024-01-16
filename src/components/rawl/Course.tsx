import * as React from "react";

const Course = () => {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <h2>Study music theory by analyzing MIDI files</h2>
        <h3>1. Tonic</h3>
        Find the main tonic for the first part of the song. A tonic is a main
        note for which a scale of seven notes is calculated. (Rarely a scale is
        5, 6 or 8 notes). Then add scale:major or scale:minor. Repeat for many
        songs - at least ten.
        <ul>
          <li>Are the major ones in the majority?</li>
          <li>
            Can you explain the usage of minor by anything? Lyrics, decade,
            genre, composer?
          </li>
        </ul>
        <h3>2. Phrases</h3>
        Some songs are perfectly square
      </div>
      <div style={{ flexGrow: 1 }}>
        <h3>Songs that I'm annotating:</h3>
      </div>
    </div>
  );
};

export default Course;
