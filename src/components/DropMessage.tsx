import * as React from "react";

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
      <div className="message-box-inner">Drop a MIDI file to play.</div>
    </div>
  </div>
);

export default React.memo(DropMessage);
