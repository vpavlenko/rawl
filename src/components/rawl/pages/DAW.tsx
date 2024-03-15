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
    </div>
  );
};

export default DAW;
