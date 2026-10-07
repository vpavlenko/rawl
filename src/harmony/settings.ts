type HarmonyAnnotation = {
  modulations?: Record<number, number | null>;
  modulationOnset?: Record<number, number>;
  measures?: unknown;
  excludedVoices?: number[];
  drumVoices?: number[];
};

// Sidecars are valid only for the annotation settings used to generate them.
// Browser-saved tonic, timing and voice edits must trigger fresh analysis.
export function harmonyAnnotationConfig(
  annotation?: HarmonyAnnotation,
  useReference = !!annotation,
) {
  const tonics = useReference
    ? Object.entries(annotation?.modulations || {})
        .filter(([, tonic]) => Number.isInteger(tonic))
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([measure, tonic]) => [
          Number(measure),
          tonic,
          annotation?.modulationOnset?.[measure] ?? null,
        ])
    : [];
  const voices = (values?: number[]) =>
    [...new Set(values || [])]
      .filter((value) => Number.isInteger(value) && value >= 0)
      .sort((a, b) => a - b);
  const stable = (value: any): any =>
    Array.isArray(value)
      ? value.map(stable)
      : value && typeof value === "object"
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, stable(value[key])]),
        )
      : value;
  return JSON.stringify({
    tonics,
    measures: stable(annotation?.measures ?? null),
    excludedVoices: voices(annotation?.excludedVoices),
    drumVoices: voices(annotation?.drumVoices),
  });
}
