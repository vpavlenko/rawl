import * as React from "react";
const { FORMATS } = require("../config");

const formatList = FORMATS.filter((f) => f !== "miniusf").map((f) => `.${f}`);
const splitPoint = Math.floor(formatList.length / 2) - 1;
const formatsLine1 = `Formats: ${formatList.slice(0, splitPoint).join(" ")}`;
const formatsLine2 = formatList.slice(splitPoint).join(" ");

const DropMessage: React.FC<{
  dropzoneProps: {
    isDragActive: boolean;
  };
}> = ({ dropzoneProps }) => (
  <div hidden={!dropzoneProps.isDragActive} className="message-box-outer">
    <div
      hidden={!dropzoneProps.isDragActive}
      className="message-box drop-message"
    >
      <div className="message-box-inner">
        Drop files to play!
        <br />
        {formatsLine1}
        <br />
        {formatsLine2}
        <br />
        <br />
        Drop a SoundFont (.sf2) to customize MIDI playback.
      </div>
    </div>
  </div>
);

export default React.memo(DropMessage);
