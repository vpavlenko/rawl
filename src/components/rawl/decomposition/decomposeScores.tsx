export interface StepExplanation {
  title: string;
  content: string;
}

export interface DecompositionStep {
  score: string;
  explanation: string;
}

export interface DecomposedScore {
  steps: DecompositionStep[];
  title: string;
}

export const decomposeScores: { [key: string]: DecomposedScore } = {
  "gibran_alcocer_-_idea_15": {
    title: "Gibran Alcocer - Idea 15",
    steps: [
      {
        score:
          "Db minor\n\nlh\n1   i 1=2=3=4=5=6=7=8=\n1b3 c 1-1b3 7 14 21\n3   i 1=q=a=x=\n3b2 c 3-3b2 1 2 3 4 5 6 7",
        explanation: "Let's use the Db minor scale.",
      },
      {
        score:
          "Db minor\n6/4\nphrases 5-3\n\nrh\n1 i 1-2-3-4-5-6-7-8-\n2 i 1,3,5,x,135_\n3 c 2 1 2 3 4 5 6 7",
        explanation: "Let's build triads on all 7 notes of this scale.",
      },
      {
        score:
          "Db minor\n6/4\nbpm 180\nphrases 5-1 20+1\nsections 2 4 6\n\nlh\n1 i qet_\n1b3 c 1-1b3 1 2 3 4 5 6 7\n\n4 i 135,qet,adg,135,qet,adg,\n5 i qet,qet,qet,qet,qet,qet,\n6 i 1,3,5,q,e,t,\n7 i 135,35q,5qe,qet,eta,tad,\n8 i 1,3,5,q,5,3,\n9 i q,eta,5,q,eta,5,\n10 i 1q,qe,qe, 5,qe,qe,\n12 c 10 0 1 2 3 4 5 6 7\n\n21 c 15\n22 c 17\n23 c 19\n24 c 18\n\n25 c 21-24",
        explanation:
          "Now we have seven chords.\n\nLet's find a pattern to play the one chord with. What can it be?\n\nOnce we found our desired pattern,  let's play all chords using it: lower note - lower+middle (twice) - upper - lower+middle (twice).\n\nAnd then let's only pick four chords we need: 4 - 6 - 1 - 7. Let's make it a loop and repeat it twice.",
      },
      {
        score:
          "Db minor\n6/4\nbpm 180\nphrases 1+1 10-3 15-3\nsections 3 5\n\nrh\n1b5 i x-q-q-q-q+\n4 c 1-2\n3 c 1-2\n2 c 1-2\n6 c 1-5\n11b5 i x-y-y-t-r+\n14 c 11-12 3\n13 c 11-12 4\n12 c 11-12 2\n15 c 11-15 2\n\nlh\n7 i 4r,ry,ry, q,ry,ry,\n8 c 7 2 4 3\n12 c 7-10\n16 c 7-10",
        explanation:
          "Now we need a melody. How about simply taking a rhythmic motive and repeat it many times?\n\nMaybe doing it together with the accompaniment will make it a nice music?\n\nOr, a bit better, what if a motive approaches a chord's lower note from above, in smallest steps?\n\nWe can target any note of a chord to sound nice. On a second repetition, let's target a middle note.",
      },
      {
        score:
          "Db minor\n6/4\nbpm 180\nphrases 1+1 14-3\nsections 4\n\nrh\n1b5 i x-q-q-7-6+\n2b5 i x-q-q-w-e+\n3b5 i x-e-r-e-q+\n4b5 i x-q-w-q-7+\n5b5 i x-w-e-w-6+\n6b5 i x-6-6-7-8+\n7b5 i x-e-e-r-t+\n8b5 i x-t-y-t-r+\n\n10b5 i x-q-q-7-6+\n11b5 i x-q-q-w-e+\n12b6 i x-q-t,t,t,t,e,e-w+\n14b5 i x-w-e-w-6+\n15b5 i x-6-6-7-8_.t_r-r-t_e_r_w+.\n\nlh\n2 i 4r,ry,ry, q,ry,ry,\n3 c 2 2 4 3\n6 c 2-5\n11 c 2-9",
        explanation:
          "The approach contour of the motive can be more diverse. Just let's make sure that both the approach tail (anacrusis) and the target are using colors of the chord underneath.\n\nAs the motive gets boring after two repetitions, let's not use it on chords 1 and 7. We'll do something more diverse instead.\n\nAnd this is exactly what Gibran Alcocer did for verse 1.\n\n",
      },
      {
        score:
          "Db minor\n6/4\nbpm 180\nphrases 9-3 14-3\nsections 3 5\n\nrh\n1 i 8-6-4- 8-6-4-\n1b4 c 1-1b4\n2 c 1 2 4 3\n\n6 i y-e-q-y-e-q-\n6b4 c 6-6b4 0 0 0\n8 c 3-4\n\n11 i y-e-q-y-e-q-u-e-q-y-e-q-\n12 c 11\n13 i t-e-q-t-e-q-\n13b4 c 11b4\n14 i r-w-7-r-w-7-t-w-7-t-w-7-\n15 c 11-14\n\n\nlh\n1 i 4r,ry,ry, q,ry,ry,\n2 c 1 2 4 3\n6 c 1-4\n11 c 1-4\n15 c 1-4",
        explanation:
          "Now, for chorus 1 let's do the rapid stairs of chord notes: \"arpeggios\".\n\nTo make it more interesting, let's put the same arpeggio on chords 4 and 6. So that we repeat the same idea twice and only then change. Western music always repeats something twice and then changes, isn't it?\n\nAnd then let's make the top line of arpeggio notes a more interesting independent line with its mini story. We'll repeat it twice, of course :)",
      },
    ],
  },
};
