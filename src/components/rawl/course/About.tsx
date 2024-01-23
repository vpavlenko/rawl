import * as React from "react";

const About = ({ sequencer }) => {
  return (
    <>
      <h3>Philosophy</h3>
      <div>
        Modern music education is skewed towards learning principles written in
        course books. This book uses principles as a navigation but gives you
        freedom to see and extract actual structures of the musical language
        directly by analyzing real arrangements in all their complexity. No
        reductionism happens. I give you the tools to make rapid and holistic
        analysis, but the object to study is as complex as it is in real life.
      </div>
      <h3>Work in progress</h3>
      <div>
        This interactive book is a work in progress. Most chapters are stubs
        with playable examples. I need to write a narrative and test it on real
        students for clearness and usefulness. I do free Zoom lessons on this
        platform to make it better. If you're interested, reach out:{" "}
        <a href="mailto:cxielamiko@gmail.com">cxielamiko@gmail.com</a>
      </div>
      <div>
        If you don't understand what I meant in any particular paragraph of this
        book or if you notice something confusing in the UI, please drop me a
        line. It likely means that most readers don't get it either, so I'll try
        to make it better.
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
