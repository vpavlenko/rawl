import * as React from "react";

const Intro = () => {
  return (
    <div>
      <div>
        Here the songs are ordered by the simplicity of arrangement. You can
        read them one by one to learn the 12-colors method.
      </div>
      <div>
        <ol>
          <li>
            <a
              href="/browse/MIDI/Lennon%20John?song=Imagine.4.mid"
              target="_blank"
            >
              John Lennon - "Imagine"
            </a>
          </li>
          <li>
            <a
              href="/browse/MIDI/The%20Beatles?song=Misery.2.mid"
              target="_blank"
            >
              The Beatles - "Misery"
            </a>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Intro;
