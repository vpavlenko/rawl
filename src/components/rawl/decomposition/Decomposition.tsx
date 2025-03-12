import {
  faArrowLeft,
  faArrowRight,
  faCopy,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import styled from "styled-components";
import { VoiceMask } from "../../App";
import { AppContext } from "../../AppContext";
import { Analysis } from "../analysis";
import Editor from "../editor/Editor";
import { DecomposedScore, decomposeScores } from "./decomposeScores";

// Styled components for the guide UI
const GuideContainer = styled.div`
  color: #e0e0e0;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background-color: #181818;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const StepTitle = styled.h2`
  color: #e0e0e0;
  margin: 0;
  font-size: 24px;
`;

const NavigationControls = styled.div`
  display: flex;
  align-items: center;
`;

const NavigationButton = styled.button`
  background-color: #3a3a3a;
  color: #e0e0e0;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:disabled {
    background-color: #2a2a2a;
    color: #606060;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #4a4a4a;
  }
`;

const StepInfo = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #a0a0a0;
  margin: 0 10px;
`;

const ExplanationContainer = styled.div`
  background-color: #232323;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
`;

const ExplanationText = styled.div`
  margin: 0;
  line-height: 1.6;
  color: #cccccc;
  white-space: pre-line;
`;

const ExplanationTextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  background-color: #2c2c2c;
  color: #e0e0e0;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;
`;

const ActionButton = styled.button`
  background-color: #3a3a3a;
  color: #e0e0e0;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4a4a4a;
  }

  &.primary {
    background-color: #4a90e2;

    &:hover {
      background-color: #3a80d2;
    }
  }
`;

const CopySuccess = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4a90e2;
  color: white;
  padding: 10px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
`;

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
  const [explanation, setExplanation] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Handler for explanation textarea focus
  const handleExplanationFocus = () => {
    if (window) {
      window.__disableGlobalShortcuts = true;
    }
  };

  // Handler for explanation textarea blur
  const handleExplanationBlur = () => {
    if (window) {
      window.__disableGlobalShortcuts = false;
    }
  };

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

  // Update URL when step changes
  useEffect(() => {
    // Only update URL if the current step in state doesn't match the URL step
    // and avoid navigation when a step was just added
    if (currentStep !== step) {
      console.log(`[Decomposition] Updating URL to step ${currentStep}`);
      // Use replace instead of push to avoid adding to browser history stack
      history.replace(`/d/${slug}/${currentStep}`);
    }
  }, [currentStep, step, slug, history]);

  // Handle step validation
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

  // Update currentCode when step changes
  useEffect(() => {
    if (localScoreData && currentStep <= localScoreData.steps.length) {
      setCurrentCode(localScoreData.steps[currentStep - 1].score);
    }
  }, [localScoreData, currentStep]);

  // Update explanation state when step changes
  useEffect(() => {
    if (localScoreData && currentStep <= localScoreData.steps.length) {
      setExplanation(localScoreData.steps[currentStep - 1].explanation || "");
    } else {
      setExplanation("");
    }
  }, [localScoreData, currentStep]);

  if (!localScoreData) {
    return <div>Score not found: {slug}</div>;
  }

  const maxSteps = localScoreData.steps.length;
  const currentStepData =
    currentStep <= localScoreData.steps.length
      ? localScoreData.steps[currentStep - 1]
      : null;

  // Handle previous step navigation
  const handlePrevStep = () => {
    if (currentStep > 1) {
      // Use history.replace for navigation to avoid state update cycles
      history.replace(`/d/${slug}/${currentStep - 1}`);
      // Update the state to match
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle next step navigation
  const handleNextStep = () => {
    if (currentStep <= maxSteps) {
      // If we're at the last step, create a new one
      if (currentStep === maxSteps && user) {
        console.log(
          `[handleNextStep] On last step (${currentStep}/${maxSteps}), duplicating...`,
        );
        const lastStep = localScoreData.steps[maxSteps - 1];
        console.log(`[handleNextStep] Last step data:`, lastStep);

        // Add a new step
        handleAddStep(lastStep.score, lastStep.explanation || "");
      } else {
        console.log(
          `[handleNextStep] Not on last step, moving to step ${
            currentStep + 1
          }`,
        );
        // Use history.replace for navigation to avoid state update cycles
        history.replace(`/d/${slug}/${currentStep + 1}`);
        // Update the state to match
        setCurrentStep(currentStep + 1);
      }
    }
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

  // Add a new step
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

    // Navigate to the new step directly using history.replace instead of setState
    // This prevents multiple re-renders and potential infinite loops
    const newStep = updatedScoreData.steps.length;
    console.log(`[Decomposition] Navigating directly to new step ${newStep}`);
    history.replace(`/d/${slug}/${newStep}`);

    // Set the current step state *after* navigation to match the URL
    setCurrentStep(newStep);
  };

  // Handle explanation text changes
  const handleExplanationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newExplanation = e.target.value;
    setExplanation(newExplanation);

    if (user && localScoreData && currentStep <= localScoreData.steps.length) {
      const updatedScoreData = { ...localScoreData };
      updatedScoreData.steps[currentStep - 1].explanation = newExplanation;
      updateLocalStorage(updatedScoreData);
    }
  };

  // Handle copy to clipboard
  const copyToClipboard = () => {
    // Format the data as TypeScript code
    const formattedData = `export const decomposeScores: { [key: string]: DecomposedScore } = ${JSON.stringify(
      { [slug]: localScoreData },
      null,
      2,
    )}`;

    // Use the clipboard API to copy the formatted data
    navigator.clipboard
      .writeText(formattedData)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => console.error("Failed to copy to clipboard:", err));
  };

  // Render the guide UI
  const renderGuide = () => {
    return (
      <GuideContainer>
        <HeaderContainer>
          <StepTitle>{localScoreData.title}</StepTitle>
          <NavigationControls>
            <NavigationButton
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </NavigationButton>
            <StepInfo>
              {currentStep}/{maxSteps}
            </StepInfo>
            <NavigationButton
              onClick={handleNextStep}
              disabled={currentStep === maxSteps && !user}
            >
              <FontAwesomeIcon
                icon={currentStep === maxSteps && user ? faPlus : faArrowRight}
              />
            </NavigationButton>
          </NavigationControls>
        </HeaderContainer>

        <ExplanationContainer>
          {user ? (
            <ExplanationTextArea
              value={explanation}
              onChange={handleExplanationChange}
              placeholder="Enter explanation for this step..."
              onFocus={handleExplanationFocus}
              onBlur={handleExplanationBlur}
            />
          ) : (
            <ExplanationText>
              {currentStepData?.explanation || ""}
            </ExplanationText>
          )}
        </ExplanationContainer>

        {user && (
          <ActionsContainer>
            <ActionButton onClick={copyToClipboard}>
              <FontAwesomeIcon icon={faCopy} />
              Copy Code
            </ActionButton>
          </ActionsContainer>
        )}

        {copySuccess && <CopySuccess>Copied to clipboard!</CopySuccess>}
      </GuideContainer>
    );
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
        savedAnalysis={savedAnalysis}
        saveAnalysis={saveAnalysis}
        getCurrentPositionMs={getCurrentPositionMs}
        seek={seek}
        disableEditing={false}
        latencyCorrectionMs={latencyCorrectionMs}
        showProgrammingManual={false}
        isDecompositionMode={true}
        onEditorChange={handleEditorChange}
        customChild={renderGuide()}
      />
    </div>
  );
};

export default withRouter(Decomposition);
