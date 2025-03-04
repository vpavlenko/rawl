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
        score: "Db minor\n6/4\n\nrh\n1 i 1,3,5,x,135_\n2 c 1 1 2 3 4 5 6 7",
        explanation: "Let's build triads on all 7 notes of this scale.",
      },
      {
        score:
          "Db minor\n6/4\nbpm 180\nphrases 5-1\nsections 2 4\n\nlh\n1 i qet_\n1b3 c 1-1b3 1 2 3 4 5 6 7\n4 i 1,qe,qe, 5,qe,qe,\n5 c 4 1 2 3 4 5 6 7\n\n12 c 7\n13 c 9\n14 c 11\n15 c 10\n\n16 c 12-15",
        explanation:
          "Let's play them together.\n\nThen let's play all of them in a pattern.\n\nAnd then let's only pick four chords we need: 4 - 6 - 1 - 7. Let's make it a loop and repeat it twice.",
      },
    ],
  },
};
