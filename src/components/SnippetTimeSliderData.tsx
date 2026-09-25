import { useContext, useEffect } from "react";
import { AppContext } from "./AppContext";
import { buildTimeSliderData } from "./buildTimeSliderData";
import { ANALYSIS_STUB } from "./rawl/analysis";
import { ParsingResult } from "./rawl/parseMidi";
import { EMPTY_TIME_SLIDER_DATA } from "./timeSliderData";

// Snippet pages play the full MIDI without mounting the score view that
// normally supplies the footer's timeline geometry.
export default function SnippetTimeSliderData({
  parsingResult,
}: {
  parsingResult: ParsingResult;
}) {
  const { currentMidi, analyses, timeSliderStore, setFirstTonic } = useContext(AppContext);
  const analysisKey = currentMidi?.analysisKey || `f/${currentMidi?.slug}`;
  const analysis = analyses[analysisKey] ?? ANALYSIS_STUB;

  useEffect(() => {
    let cancelled = false;
    timeSliderStore.publish(EMPTY_TIME_SLIDER_DATA);
    setFirstTonic(analysis.modulations[1] ?? null);
    buildTimeSliderData(parsingResult, analysis).then((data) => {
      if (!cancelled) timeSliderStore.publish(data);
    }).catch((error) => {
      if (!cancelled) console.error("Unable to prepare time slider colors", error);
    });
    return () => {
      cancelled = true;
      timeSliderStore.publish(EMPTY_TIME_SLIDER_DATA);
    };
  }, [parsingResult, analysis, timeSliderStore, setFirstTonic]);

  return null;
}
