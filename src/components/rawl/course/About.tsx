import * as React from "react";

const About = ({ sequencer }) => {
  return (
    <>
      <h3>Work in progress</h3>
      <div>
        This interactive book is a work in progress. Most chapters are stubs
        with playable examples. I do free Zoom lessons on this platform to make
        it better. If you're interested, reach out:{" "}
        <a href="mailto:cxielamiko@gmail.com">cxielamiko@gmail.com</a>
      </div>
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
