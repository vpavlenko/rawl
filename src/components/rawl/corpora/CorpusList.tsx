import * as React from "react";
import { corpora } from "./corpora";
import { beautifySlug } from "./utils";

const CorpusList: React.FC<{ slug: string }> = ({ slug }) => {
  const corpus = corpora.find((c) => c.slug === slug);

  if (!corpus) {
    return <div>Corpus {slug} not found</div>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {corpus.midis.map((midi) => (
        <li key={midi} style={{ marginBottom: "8px" }}>
          <a href={`/f/${midi}`} target="_blank" rel="noopener noreferrer">
            {beautifySlug(midi)}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default CorpusList;
