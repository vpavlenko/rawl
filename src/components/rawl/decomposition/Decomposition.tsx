import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { VoiceMask } from "../../App";
import { Analysis } from "../analysis";
import Editor from "../editor/Editor";
import DecompositionGuide from "./DecompositionGuide";
import { decomposeScores } from "./decomposeScores";

interface DecompositionProps extends RouteComponentProps {
  slug: string;
  step: number;
  setVoiceMask: (voiceMask: VoiceMask) => void;
  voiceMask: VoiceMask;
  voiceNames: string[];
  registerKeyboardHandler: (
    id: string,
    handler: (e: KeyboardEvent) => void,
  ) => void;
  unregisterKeyboardHandler: (id: string) => void;
  analysisEnabled: boolean;
  savedAnalysis: Analysis | null;
  saveAnalysis: (analysis: Analysis) => Promise<void>;
  getCurrentPositionMs?: () => number;
  seek?: (ms: number) => void;
  latencyCorrectionMs: number;
}

const Decomposition: React.FC<DecompositionProps> = ({
  history,
  slug,
  step,
  setVoiceMask,
  voiceMask,
  voiceNames,
  registerKeyboardHandler,
  unregisterKeyboardHandler,
  analysisEnabled,
  savedAnalysis,
  saveAnalysis,
  getCurrentPositionMs,
  seek,
  latencyCorrectionMs,
}) => {
  const decomposedScore = decomposeScores[slug];
  const [currentStep, setCurrentStep] = useState(step);
  const [currentCode, setCurrentCode] = useState("");

  useEffect(() => {
    // Update URL when step changes
    if (currentStep !== step) {
      history.push(`/d/${slug}/${currentStep}`);
    }
  }, [currentStep, step, slug, history]);

  // Redirect to step 1 if the requested step is out of bounds
  useEffect(() => {
    if (decomposedScore) {
      const maxSteps = decomposedScore.steps.length;
      if (step < 1 || step > maxSteps) {
        setCurrentStep(1);
      } else {
        setCurrentStep(step);
      }
    }
  }, [decomposedScore, step]);

  useEffect(() => {
    // Update currentCode when step changes
    if (decomposedScore && currentStep <= decomposedScore.steps.length) {
      setCurrentCode(decomposedScore.steps[currentStep - 1].score);
    }
  }, [decomposedScore, currentStep]);

  if (!decomposedScore) {
    return <div>Score not found: {slug}</div>;
  }

  const currentStepData =
    currentStep <= decomposedScore.steps.length
      ? decomposedScore.steps[currentStep - 1]
      : null;

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
  };

  const handleEditorChange = (newCode: string) => {
    setCurrentCode(newCode);
  };

  return (
    <div>
      <Editor
        initialSource={currentStepData?.score || ""}
        setVoiceMask={setVoiceMask}
        voiceMask={voiceMask}
        voiceNames={voiceNames}
        registerKeyboardHandler={registerKeyboardHandler}
        unregisterKeyboardHandler={unregisterKeyboardHandler}
        analysisEnabled={analysisEnabled}
        savedAnalysis={savedAnalysis}
        saveAnalysis={saveAnalysis}
        getCurrentPositionMs={getCurrentPositionMs}
        seek={seek}
        disableEditing={false}
        latencyCorrectionMs={latencyCorrectionMs}
        showProgrammingManual={false}
        isDecompositionMode={true}
        onEditorChange={handleEditorChange}
        customChild={
          <DecompositionGuide
            slug={slug}
            step={currentStep}
            onStepChange={handleStepChange}
            currentSource={currentCode}
          />
        }
      />
    </div>
  );
};

export default withRouter(Decomposition);
