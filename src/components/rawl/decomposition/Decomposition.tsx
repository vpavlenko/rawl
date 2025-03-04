import React, { useCallback, useContext, useEffect, useState } from "react";
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

  // Single function to handle all localStorage operations
  const updateLocalStorage = useCallback(
    (updatedData: DecomposedScore) => {
      try {
        console.log(`[Decomposition] Updating localStorage for slug: ${slug}`);
        // Get current stored data
        const storedData = localStorage.getItem(STORAGE_KEY) || "{}";
        const parsedData = JSON.parse(storedData);

        // Update with new data
        parsedData[slug] = updatedData;

        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));

        // Update local state
        setLocalScoreData(updatedData);
        console.log(
          `[Decomposition] Successfully updated localStorage and local state`,
        );
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }
    },
    [slug],
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

  // Handle step validation (simplified - removed the redundant localStorage check)
  useEffect(() => {
    if (localScoreData) {
      const maxSteps = localScoreData.steps.length;

      if (step < 1 || step > maxSteps) {
        console.log(
          `[Decomposition] Step ${step} out of bounds (max: ${maxSteps}), redirecting to step 1`,
        );
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

  // Handle step navigation
  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
  };

  // Handle editor content change
  const handleEditorChange = (newCode: string) => {
    setCurrentCode(newCode);

    // If we have current step data, update the score in localStorage
    if (user && localScoreData && currentStep <= localScoreData.steps.length) {
      const updatedScoreData = { ...localScoreData };
      updatedScoreData.steps[currentStep - 1].score = newCode;
      updateLocalStorage(updatedScoreData);
    }
  };

  // Add a new step - this is the function we'll pass to DecompositionGuide
  const handleAddStep = (score: string, explanation: string) => {
    if (!user || !localScoreData) return;

    console.log(`[Decomposition] Adding new step with score and explanation`);

    const updatedScoreData = { ...localScoreData };
    updatedScoreData.steps.push({
      score,
      explanation,
    });

    // Update localStorage with new step
    updateLocalStorage(updatedScoreData);

    // Navigate to the new step
    const newStep = updatedScoreData.steps.length;
    setCurrentStep(newStep);
  };

  // Update explanation for current step
  const handleExplanationChange = (explanation: string) => {
    if (!user || !localScoreData || currentStep > localScoreData.steps.length)
      return;

    console.log(`[Decomposition] Updating explanation for step ${currentStep}`);

    const updatedScoreData = { ...localScoreData };
    updatedScoreData.steps[currentStep - 1].explanation = explanation;

    // Update localStorage with new explanation
    updateLocalStorage(updatedScoreData);
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
            decomposedScore={localScoreData}
            onAddStep={handleAddStep}
            onExplanationChange={handleExplanationChange}
          />
        }
      />
    </div>
  );
};

export default withRouter(Decomposition);
