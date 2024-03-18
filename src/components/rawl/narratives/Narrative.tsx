import * as React from "react";
import EmbeddedRawl from "./EmbeddedRawl";

const Narrative = ({ analyses }) => {
  return (
    <div style={{ width: "600px" }}>
      Narrative
      <EmbeddedRawl
        file={
          "static/musescore_manual?song=Pirates_of_the_Caribbean_-_Hes_a_Pirate.mid"
        }
        analyses={analyses}
        measures={[77, 87]}
      />
    </div>
  );
};

export default Narrative;
