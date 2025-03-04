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
          "C major\n4/4\nbpm 120\n\nlh\n1 i 1,. qet,. qet,\n\nrh\n1 i x-q-w,e-r,t,",
        explanation: "",
      },
      {
        score:
          "C major\n4/4\nbpm 120\n\nlh\n1 i 1,. qet,. qet,  \n2 c 1 3 4 0\n\nrh\n1 i x-q-w,e-r,t,\n2 c 1 1 2",
        explanation: "Pick a bass line 4 - 6 - 1 - 7 in 6/4.",
      },
      {
        score:
          "C major\n4/4\nbpm 120\n\nlh\n1 i 1,. qet,. qet,  \n2 c 1 3 4 0\n\nrh\n1 i x-q-w,e-r,t,\n2 c 1 1 2\n4 i x,a_.\n\n5 ac 1-4",
        explanation: "",
      },
      {
        score:
          "C major\n4/4\nbpm 120\n\nlh\n1 i 1,. qet,. qet,  \n2 c 1 3 4 0\n\nrh\n1 i x-q-w,e-r,t,\n2 c 1 1 2\n4 i x,a_.\n\n5 ac 1-4",
        explanation: "",
      },
    ],
  },
};
