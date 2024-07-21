import * as React from "react";

const corpora = [
  {
    slug: "first_love",
    midis: ["i---yiruma"],
  },
];

const Corpus: React.FC<{ slug: string }> = ({ slug }) => {
  const corpus = corpora.filter((corpus) => corpus.slug === slug)?.[0];
  if (!corpus) {
    return <div>Corpus {slug} not found</div>;
  }

  return (
    <div>
      <h1>{slug}</h1>
      {corpus.midis.map((midiSlug) => (
        <a href={`/f/${midiSlug}`} target="_blank">
          {midiSlug}
        </a>
      ))}
    </div>
  );
};

export default Corpus;
