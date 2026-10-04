// A small, reproducible pairwise linear ranker for detected bass passages.
// Tagged snippets are positive bags: any overlapping detection can represent
// the example. Explicit negative labels are scored as hard comparisons; other
// pieces are comparison passages, not certified negatives.
// Phrase starts stay out of the model until they can be estimated from MIDI for
// every candidate; using only tagged analyses would leak the labels.
const FEATURE_NAMES = [
  "bassNotesUpToEight",
  "extraBassNotesUpToFour",
  "minorSupport",
  "skippedSteps",
  "doubledGaps",
  "chromaticStepRatio",
  "logHarmonicPulse",
  "longMinorDescent",
  "minorThirdAttackShare",
  "openingMinorPlausibility",
  "annotatedKeyDistance",
];

const FEATURE_SIGNS = [1, 1, 1, -1, -1, 1, 0, 1];
// Tuned after fitting the original features, so the new signal does not
// displace the learned bass/rhythm weights in this small training set.
const MINOR_THIRD_SHARE_WEIGHT = 0.02;
const OPENING_MINOR_PLAUSIBILITY_WEIGHT = 0.005;
const ANNOTATED_KEY_DISTANCE_WEIGHT = -0.0075;
const HARD_NEGATIVES = 150;
const EXPLICIT_NEGATIVE_WEIGHT = 15;
const REGULARIZATION = 0.1;
const EPOCHS = 150;
const FOLDS = 4;

function features(candidate) {
  return [
    Math.min(candidate.bassNotes, 8),
    Math.min(Math.max(0, candidate.bassNotes - 8), 4),
    candidate.minorSupport,
    candidate.skipped,
    candidate.doubledGaps,
    candidate.semitones / Math.max(1, candidate.bassNotes - 1),
    Math.log2(candidate.harmonicPulseBeats),
    Math.min(candidate.bassNotes, 8) * Number(candidate.minorSupport === 2),
    candidate.minorThirdAttackShare,
    candidate.openingMinorPlausibility,
    candidate.annotatedKeyDistance ?? 0,
  ];
}

function overlap(candidate, [from, to]) {
  return Math.max(0, Math.min(candidate.to, to) - Math.max(candidate.from, from) + 1) >=
    Math.min(2, to - from + 1);
}

function oldComparator(a, b) {
  return Math.min(b.bassNotes, 8) - Math.min(a.bassNotes, 8) ||
    b.minorSupport - a.minorSupport ||
    a.doubledGaps - b.doubledGaps ||
    a.skipped - b.skipped ||
    Math.max(0, a.bassNotes - 8) - Math.max(0, b.bassNotes - 8) ||
    b.bassNotes - a.bassNotes ||
    a.slug.localeCompare(b.slug);
}

function foldFor(slug) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % FOLDS;
}

function fitLinearRanker(candidates, tagged, negativeTagged = new Map()) {
  const groups = [...tagged].flatMap(([slug, snippets]) => snippets.map((snippet) => ({
    slug,
    hits: candidates.filter((candidate) => candidate.slug === slug &&
      overlap(candidate, snippet.measuresSpan)),
  }))).filter((group) => group.hits.length);
  const negativeGroups = [...negativeTagged].flatMap(([slug, snippets]) =>
    snippets.map((snippet) => ({ slug, hits: candidates.filter((candidate) =>
      candidate.slug === slug && candidate.from === snippet.measuresSpan[0] &&
      candidate.to === snippet.measuresSpan[1]) }))).filter((group) => group.hits.length);
  const comparisons = candidates.filter((candidate) =>
    !tagged.has(candidate.slug) && !negativeTagged.has(candidate.slug));
  const vectors = new Map(candidates.map((candidate) => [candidate, features(candidate)]));
  const keyDistanceIndex = FEATURE_NAMES.indexOf("annotatedKeyDistance");
  const means = FEATURE_NAMES.map((_, feature) => feature === keyDistanceIndex ? 0 :
    candidates.reduce((sum, candidate) => sum + vectors.get(candidate)[feature], 0) / candidates.length);
  const scales = means.map((mean, feature) => feature === keyDistanceIndex ? 1 :
    Math.max(1e-6, Math.sqrt(candidates.reduce((sum, candidate) =>
      sum + (vectors.get(candidate)[feature] - mean) ** 2, 0) / candidates.length)));
  const normalized = new Map(candidates.map((candidate) => [candidate,
    vectors.get(candidate).map((value, feature) => (value - means[feature]) / scales[feature])]));
  const score = (candidate, weights) => normalized.get(candidate).reduce(
    (sum, value, feature) => sum + value * (weights[feature] ?? 0), 0);
  const order = (rows, weights) => [...rows].sort((a, b) =>
    score(b, weights) - score(a, weights) || a.slug.localeCompare(b.slug));

  const withFixedFactors = (weights) => [
    ...weights, MINOR_THIRD_SHARE_WEIGHT, OPENING_MINOR_PLAUSIBILITY_WEIGHT,
    ANNOTATED_KEY_DISTANCE_WEIGHT,
  ];

  function train(trainingGroups, trainingNegatives) {
    const weights = [1, 0.1, 0.4, -0.2, -0.2, 0.1, 0, 0.2];
    for (let epoch = 0; epoch < EPOCHS; epoch++) {
      const fullWeights = withFixedFactors(weights);
      const hard = order(comparisons, fullWeights).slice(0, HARD_NEGATIVES);
      const explicitNegatives = trainingNegatives.map((group) =>
        order(group.hits, fullWeights)[0]);
      const gradient = Array(FEATURE_NAMES.length).fill(0);
      for (const group of trainingGroups) {
        const positive = order(group.hits, fullWeights)[0];
        const positiveVector = normalized.get(positive);
        for (const [negative, importance] of [
          ...hard.map((candidate) => [candidate, 1]),
          ...explicitNegatives.map((candidate) => [candidate, EXPLICIT_NEGATIVE_WEIGHT]),
        ]) {
          const difference = score(positive, fullWeights) - score(negative, fullWeights);
          const factor = -1 / (1 + Math.exp(Math.min(50, difference)));
          const negativeVector = normalized.get(negative);
          for (let feature = 0; feature < gradient.length; feature++) {
            gradient[feature] += importance * factor * (positiveVector[feature] - negativeVector[feature]);
          }
        }
      }
      const step = 0.25 / (1 + epoch / 40);
      const count = trainingGroups.length *
        (hard.length + trainingNegatives.length * EXPLICIT_NEGATIVE_WEIGHT);
      for (let feature = 0; feature < weights.length; feature++) {
        weights[feature] -= step * (gradient[feature] / count + REGULARIZATION * weights[feature]);
        if (FEATURE_SIGNS[feature] > 0) weights[feature] = Math.max(0, weights[feature]);
        if (FEATURE_SIGNS[feature] < 0) weights[feature] = Math.min(0, weights[feature]);
      }
    }
    return weights;
  }

  const ranks = (sorted, selectedGroups) => {
    const position = new Map(sorted.map((candidate, index) => [candidate, index + 1]));
    return selectedGroups.map((group) => Math.min(...group.hits.map((hit) => position.get(hit))));
  };
  const metrics = (positions) => ({
    top100: positions.filter((rank) => rank <= 100).length,
    top200: positions.filter((rank) => rank <= 200).length,
    medianRank: [...positions].sort((a, b) => a - b)[Math.floor(positions.length / 2)],
  });
  const baseline = metrics(ranks([...candidates].sort(oldComparator), groups));
  const heldOutRanks = [];
  const heldOutNegativeRanks = [];
  for (let fold = 0; fold < FOLDS; fold++) {
    const training = groups.filter((group) => foldFor(group.slug) !== fold);
    const heldOut = groups.filter((group) => foldFor(group.slug) === fold);
    const trainingNegatives = negativeGroups.filter((group) => foldFor(group.slug) !== fold);
    const heldOutNegatives = negativeGroups.filter((group) => foldFor(group.slug) === fold);
    const sorted = order(candidates, withFixedFactors(train(training, trainingNegatives)));
    heldOutRanks.push(...ranks(sorted, heldOut));
    const positions = new Map(sorted.map((candidate, index) => [candidate, index + 1]));
    heldOutNegativeRanks.push(...heldOutNegatives.map((group) =>
      Math.min(...group.hits.map((candidate) => positions.get(candidate)))));
  }
  const weights = withFixedFactors(train(groups, negativeGroups));
  const ranked = order(candidates, weights);
  const negativeRanks = (sorted) => {
    const positions = new Map(sorted.map((candidate, index) => [candidate, index + 1]));
    return negativeGroups.map((group) =>
      Math.min(...group.hits.map((candidate) => positions.get(candidate))));
  };
  const breakdown = (candidate) => normalized.get(candidate).map((standardized, index) => ({
    feature: FEATURE_NAMES[index],
    value: index === keyDistanceIndex && candidate.annotatedKeyDistance == null ? null :
      Number(vectors.get(candidate)[index].toFixed(6)),
    weight: Number(weights[index].toFixed(6)),
    contribution: Number((standardized * weights[index]).toFixed(6)),
  }));
  return {
    score: (candidate) => score(candidate, weights),
    breakdown,
    report: {
      kind: "pairwise linear ranker",
      features: FEATURE_NAMES,
      weights: weights.map((weight) => Number(weight.toFixed(6))),
      means: means.map((mean) => Number(mean.toFixed(6))),
      scales: scales.map((scale) => Number(scale.toFixed(6))),
      hardNegatives: HARD_NEGATIVES,
      explicitNegativeWeight: EXPLICIT_NEGATIVE_WEIGHT,
      explicitNegatives: negativeGroups.length,
      regularization: REGULARIZATION,
      epochs: EPOCHS,
      fixedMinorThirdShareWeight: MINOR_THIRD_SHARE_WEIGHT,
      fixedOpeningMinorPlausibilityWeight: OPENING_MINOR_PLAUSIBILITY_WEIGHT,
      fixedAnnotatedKeyDistanceWeight: ANNOTATED_KEY_DISTANCE_WEIGHT,
      trainingExamples: groups.length,
      unretrievedExamples: [...tagged.values()].reduce((sum, snippets) => sum + snippets.length, 0) - groups.length,
      comparisonPassages: comparisons.length,
      baseline: { ...baseline, examples: groups.length },
      heldOut: { ...metrics(heldOutRanks), examples: groups.length, folds: FOLDS },
      fitted: { ...metrics(ranks(ranked, groups)), examples: groups.length },
      negativeRanks: {
        baseline: negativeRanks([...candidates].sort(oldComparator)),
        heldOut: heldOutNegativeRanks,
        fitted: negativeRanks(ranked),
      },
    },
  };
}

module.exports = { fitLinearRanker, overlap };
