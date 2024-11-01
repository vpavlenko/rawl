import * as React from "react";
import CorpusList from "../corpora/CorpusList";

const CMajorHarmony = () => {
  return (
    <div>
      <h1>C Major Harmony</h1>
      <p>This chapter explores harmony in the key of C major...</p>
      <p>Here we analyze the corpus chapters_c_major:</p>
      <CorpusList slug="chapters_c_major" />
    </div>
  );
};

export default CMajorHarmony;
