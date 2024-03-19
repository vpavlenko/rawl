import * as React from "react";
import { AppStateForRawl } from "../Rawl";
import EmbeddedRawl from "./EmbeddedRawl";

const Narrative: React.FC<{ analyses: any; rawlState: AppStateForRawl }> = ({
  analyses,
  rawlState,
}) => {
  return (
    <div style={{ width: "600px" }}>
      <h3>iv-i-V-i</h3>
      <EmbeddedRawl
        staticMidiFileId={38}
        analyses={analyses}
        rawlState={rawlState}
      />
      <EmbeddedRawl
        staticMidiFileId={50}
        analyses={analyses}
        rawlState={rawlState}
      />
      <EmbeddedRawl
        staticMidiFileId={59}
        analyses={analyses}
        rawlState={rawlState}
      />
      <EmbeddedRawl
        staticMidiFileId={140}
        analyses={analyses}
        rawlState={rawlState}
      />
    </div>
  );
};

export default Narrative;
