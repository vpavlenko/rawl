import * as React from "react";
import reaperImage from "../../../assets/images/reaper_colormap.png";

const DAW = () => {
  return (
    <div className="course" style={{ marginLeft: 250, width: 600 }}>
      <h2>DAWs with 12 colors</h2>
      <h3>REAPER</h3>
      <h4>How to use</h4>
      <ul>
        <li>
          <a href={reaperImage} download="reaper_colormap.png">
            <img src={reaperImage} alt="Reaper" style={{ maxWidth: "100%" }} />
          </a>
        </li>
        <li>
          Preferences - Editing behavior - MIDI Editor - Default note color map
        </li>
        <li>
          Issue: will only work for C major / C minor, needs to be shifted for
          other keys.
        </li>
      </ul>
      <h4>How to update</h4>
      <ul>
        <li>
          <a
            href="https://reaper-midi-colormap-tool.netlify.app/"
            target="_blank"
          >
            https://reaper-midi-colormap-tool.netlify.app/
          </a>
        </li>
        <li>
          <a
            href="https://chat.openai.com/share/eb2b635a-0c55-414a-bfb0-830dbde0aba4"
            target="_blank"
          >
            https://chat.openai.com/share/eb2b635a-0c55-414a-bfb0-830dbde0aba4
          </a>
        </li>
      </ul>
      <h3>Signal</h3>
      <a href="https://signal-jy5a-two.vercel.app/edit" target="_blank">
        https://signal-jy5a-two.vercel.app/edit
      </a>
      <h3>Cubase</h3>
      Cubase has{" "}
      <a
        href="https://steinberg.help/cubase_pro/v12/en/cubase_nuendo/topics/midi_editors/midi_editors_pitch_colors_r.html"
        target="_blank"
      >
        Pitch Colors Setup
      </a>
      , it may be{" "}
      <a
        href="https://chat.openai.com/share/14e28957-610e-4a3e-a5b5-d4cf47c149be"
        target="_blank"
      >
        shareable
      </a>
      .<h3>MuseScore</h3>
      <a
        href="https://youtu.be/Eq3bUFgEcb4?si=IhXpNtcvvqtQhCv1&t=4470"
        target="_blank"
      >
        Promised
      </a>
    </div>
  );
};

export default DAW;
