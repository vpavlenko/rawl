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
      // Step 1: Basic structure
      {
        score: `C major
4/4
bpm 120

lh
1 i 1,. qet,. qet,

rh
1 i x-q-w,e-r,t,`,
        explanation:
          "This is the most basic form of the piece, showing just the main melodic idea in the right hand and a simple accompaniment in the left hand.",
      },
      // Step 2: Add more development
      {
        score: `C major
4/4
bpm 120

lh
1 i 1,. qet,. qet,  
2 c 1 3 4 0

rh
1 i x-q-w,e-r,t,
2 c 1 1 2`,
        explanation:
          "In this step, we add measure 2 which copies the initial pattern with scale-wise shifts in both hands, creating harmonic development. The left hand applies shifts to scale degrees 3, 4, and 0, while the right hand copies with shifts to scale degrees 1 and 2.",
      },
      // Step 3: Complete piece
      {
        score: `C major
4/4
bpm 120

lh
1 i 1,. qet,. qet,  
2 c 1 3 4 0

rh
1 i x-q-w,e-r,t,
2 c 1 1 2
4 i x,a_.

5 ac 1-4`,
        explanation:
          "The final step adds a contrasting idea in measure 4 with a longer note value (a_) and then uses the 'ac' command to create a complete 8-measure phrase by autocompleting measures 1-4.",
      },
    ],
  },
};
