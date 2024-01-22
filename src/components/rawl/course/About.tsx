import * as React from "react";

const About = ({ sequencer }) => {
  return (
    <>
      <h3>Tech details</h3>
      <div>
        Built on top of{" "}
        <a
          href="https://chiptune.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chip Player JS
        </a>
        , credits to{" "}
        <a
          href="https://github.com/mmontag"
          target="_blank"
          rel="noopener noreferrer"
        >
          Matt Montag
        </a>
      </div>
    </>
  );
};

export default About;
