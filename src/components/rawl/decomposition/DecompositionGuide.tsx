import {
  faArrowLeft,
  faArrowRight,
  faCopy,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { DecomposedScore } from "./decomposeScores";

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

const ExplanationText = styled.p`
  margin: 0;
  line-height: 1.6;
  color: #cccccc;
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

interface DecompositionGuideProps {
  slug: string;
  step: number;
  onStepChange: (step: number) => void;
  currentSource?: string;
  decomposedScore: DecomposedScore;
  onAddStep: (score: string, explanation: string) => void;
  onExplanationChange: (explanation: string) => void;
}

const STORAGE_KEY = "decompositionData";

const DecompositionGuide: React.FC<DecompositionGuideProps> = ({
  slug,
  step,
  onStepChange,
  currentSource,
  decomposedScore,
  onAddStep,
  onExplanationChange,
}) => {
  const { user } = useContext(AppContext);
  const [explanation, setExplanation] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Initialize or update the explanation when the step changes
  useEffect(() => {
    if (decomposedScore && step <= decomposedScore.steps.length) {
      setExplanation(decomposedScore.steps[step - 1].explanation || "");
    } else {
      setExplanation("");
    }
  }, [decomposedScore, step]);

  // Update localStorage when currentSource (code from editor) changes
  useEffect(() => {
    if (!user || !currentSource || !decomposedScore) return;

    const currentStepData =
      step <= decomposedScore.steps.length
        ? decomposedScore.steps[step - 1]
        : null;

    if (currentStepData && currentStepData.score !== currentSource) {
      // The parent component (Decomposition) will handle localStorage updates via onEditorChange
    }
  }, [currentSource, slug, step, user, decomposedScore]);

  if (!decomposedScore) {
    return <GuideContainer>Score not found: {slug}</GuideContainer>;
  }

  const maxSteps = decomposedScore.steps.length;
  console.log(
    `[Rendering] maxSteps calculated as ${maxSteps}, current step is ${step}`,
  );
  console.log(`[Rendering] decomposedScore:`, decomposedScore);
  const currentStepData =
    step <= maxSteps ? decomposedScore.steps[step - 1] : null;

  const handlePrevStep = () => {
    if (step > 1) {
      onStepChange(step - 1);
    }
  };

  const handleNextStep = () => {
    if (step <= maxSteps) {
      // If we're at the last step, create a new one
      if (step === maxSteps && user) {
        console.log(
          `[handleNextStep] On last step (${step}/${maxSteps}), duplicating...`,
        );
        const lastStep = decomposedScore.steps[maxSteps - 1];
        console.log(`[handleNextStep] Last step data:`, lastStep);
        // Explicitly add a new step by calling the parent handler
        onAddStep(lastStep.score, lastStep.explanation || "");
      } else {
        console.log(
          `[handleNextStep] Not on last step, moving to step ${step + 1}`,
        );
        onStepChange(step + 1);
      }
    }
  };

  const handleExplanationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newExplanation = e.target.value;
    setExplanation(newExplanation);

    if (user && currentStepData) {
      onExplanationChange(newExplanation);
    }
  };

  const copyToClipboard = () => {
    // Format the data as TypeScript code
    const formattedData = `export const decomposeScores: { [key: string]: DecomposedScore } = ${JSON.stringify(
      { [slug]: decomposedScore },
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

  return (
    <GuideContainer>
      <HeaderContainer>
        <StepTitle>{decomposedScore.title}</StepTitle>
        <NavigationControls>
          <NavigationButton onClick={handlePrevStep} disabled={step === 1}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </NavigationButton>
          <StepInfo>
            {step}/{maxSteps}
          </StepInfo>
          <NavigationButton
            onClick={handleNextStep}
            disabled={step === maxSteps && !user}
          >
            <FontAwesomeIcon icon={step === maxSteps ? faPlus : faArrowRight} />
          </NavigationButton>
        </NavigationControls>
      </HeaderContainer>

      <ExplanationContainer>
        {user ? (
          <ExplanationTextArea
            value={explanation}
            onChange={handleExplanationChange}
            placeholder="Enter explanation for this step..."
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

export default DecompositionGuide;
