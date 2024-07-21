import * as React from "react";

// I skip "14 I… 48:33" since it's basically track 1 with added violin.
// I skip "13 Dream A Little Dream Of Me 46:25" since it's not original.
// I skip "07 When The Love Falls 23:28" since it's not original.
// For "05 Passing By 15:17" and "09 Time Forgets… 29:52" I use versions without a cello, since
// it's doubling a piano melody anyways.
const corpora = [
  {
    slug: "first_love",
    midis: [
      "i---yiruma",
      "may-be---yiruma",
      "yiruma---love-me",
      "river-flows-in-you",
      "passing-by---yiruma",
      "it-s-your-day---yiruma",
      "left-my-hearts---yiruma",
      "time-forgets---yiruma",
    ],
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
        <div>
          <a href={`/f/${midiSlug}`} target="_blank">
            {midiSlug}
          </a>
        </div>
      ))}
    </div>
  );
};

export default Corpus;
