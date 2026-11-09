type FittingSection = {
  durationSeconds: number;
  measureCount: number;
  offsetSeconds: number;
  offsetMeasures: number;
};

export function getFittedSecondWidth(
  sections: FittingSection[],
  targetWidth: number,
): number | undefined {
  const maxMeasuresToFit = 34;
  let widest: FittingSection | undefined;
  let rightmostSeconds = 0;

  sections.forEach((section) => {
    const rightMeasures = section.offsetMeasures + section.measureCount;
    const rightSeconds = section.offsetSeconds + section.durationSeconds;
    if (
      section.measureCount > 0 && section.durationSeconds > 0 &&
      rightMeasures > 0 && rightMeasures <= maxMeasuresToFit &&
      Number.isFinite(rightSeconds) && rightSeconds > rightmostSeconds
    ) {
      widest = section;
      rightmostSeconds = rightSeconds;
    }
  });

  if (!widest) return undefined;
  return Math.min(
    targetWidth / rightmostSeconds,
    300 * widest.measureCount / widest.durationSeconds,
  );
}
