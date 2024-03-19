import * as React from "react";
import { AppStateForRawl } from "../Rawl";
import EmbeddedRawl from "./EmbeddedRawl";

const Narrative: React.FC<{ analyses: any; rawlState: AppStateForRawl }> = ({
  analyses,
  rawlState,
}) => {
  return (
    <div style={{ width: "600px" }}>
      Narrative
      <EmbeddedRawl
        song={"Pirates_of_the_Caribbean_-_Hes_a_Pirate.mid"}
        analyses={analyses}
        measures={[77, 87]}
        rawlState={rawlState}
      />
      <EmbeddedRawl
        song={"Bella_Ciao.mid"}
        analyses={analyses}
        measures={[77, 87]}
        rawlState={rawlState}
      />
    </div>
  );
};

export default Narrative;
