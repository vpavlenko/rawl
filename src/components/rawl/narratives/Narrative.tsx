import * as React from "react";
import { AppStateForRawl } from "../Rawl";
import EmbeddedRawl from "./EmbeddedRawl";

const Narrative: React.FC<{ analyses: any; rawlState: AppStateForRawl }> = ({
  analyses,
  rawlState,
}) => {
  const path =
    "/static/musescore_manual/Pirates_of_the_Caribbean_-_Hes_a_Pirate.mid";
  return (
    <div style={{ width: "600px" }}>
      Narrative
      <EmbeddedRawl
        file={
          "static/musescore_manual?song=Pirates_of_the_Caribbean_-_Hes_a_Pirate.mid"
        }
        analyses={analyses}
        measures={[77, 87]}
        rawlState={rawlState}
      />
    </div>
  );
};

export default Narrative;
