import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { VoiceMask } from "../../App";
import { AppContext } from "../../AppContext";
import { Analysis } from "../analysis";
import Editor from "../editor/Editor";
import DecompositionGuide from "./DecompositionGuide";
import { DecomposedScore, decomposeScores } from "./decomposeScores";

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

const STORAGE_KEY = "decompositionData";

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
  const { user } = useContext(AppContext);
  const [currentStep, setCurrentStep] = useState(step);
  const [currentCode, setCurrentCode] = useState("");
  const [localScoreData, setLocalScoreData] = useState<DecomposedScore | null>(
    null,
  );

  // Load data from localStorage or fall back to decomposeScores
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData[slug]) {
          setLocalScoreData(parsedData[slug]);
          return;
        }
      }
    } catch (error) {
      console.error(
        "Error loading decomposition data from localStorage:",
        error,
      );
    }

    // Fall back to default data if not in localStorage
    setLocalScoreData(decomposeScores[slug] || null);
  }, [slug]);

  useEffect(() => {
    // Update URL when step changes
    if (currentStep !== step) {
      history.push(`/d/${slug}/${currentStep}`);
    }
  }, [currentStep, step, slug, history]);

  // Redirect to step 1 if the requested step is out of bounds
  useEffect(() => {
    if (localScoreData) {
      const maxSteps = localScoreData.steps.length;
      if (step < 1 || step > maxSteps) {
        setCurrentStep(1);
      } else {
        setCurrentStep(step);
      }
    }
  }, [localScoreData, step]);

  useEffect(() => {
    // Update currentCode when step changes
    if (localScoreData && currentStep <= localScoreData.steps.length) {
      setCurrentCode(localScoreData.steps[currentStep - 1].score);
    }
  }, [localScoreData, currentStep]);

  if (!localScoreData) {
    return <div>Score not found: {slug}</div>;
  }

  const currentStepData =
    currentStep <= localScoreData.steps.length
      ? localScoreData.steps[currentStep - 1]
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
