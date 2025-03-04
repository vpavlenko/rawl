import {
  faArrowLeft,
  faArrowRight,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { DecomposedScore, decomposeScores } from "./decomposeScores";

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
}

const STORAGE_KEY = "decompositionData";

const DecompositionGuide: React.FC<DecompositionGuideProps> = ({
  slug,
  step,
  onStepChange,
  currentSource,
}) => {
  const { user } = useContext(AppContext);
  const [localScores, setLocalScores] = useState<{
    [key: string]: DecomposedScore;
  }>({});
  const [explanation, setExplanation] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Initialize localScores from localStorage on component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const parsedData = storedData ? JSON.parse(storedData) : {};

      // If there are no stored scores for this slug, initialize from decomposeScores
      if (!parsedData[slug] && decomposeScores[slug]) {
        parsedData[slug] = { ...decomposeScores[slug] };

        // Only save to localStorage if user is logged in
        if (user) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
        }
      }

      setLocalScores(parsedData);
    } catch (error) {
      console.error(
        "Error loading decomposition data from localStorage:",
        error,
      );
      setLocalScores({});
    }
  }, [slug, user]);

  // Get the score data (either from localStorage or the original)
  const getScoreData = () => {
    if (localScores[slug]) {
      return localScores[slug];
    }
    return decomposeScores[slug];
  };

  const decomposedScore = getScoreData();

  // Initialize or update the explanation when the step changes
  useEffect(() => {
    if (decomposedScore && step <= decomposedScore.steps.length) {
      setExplanation(decomposedScore.steps[step - 1].explanation);
    } else {
      setExplanation("");
    }
  }, [decomposedScore, step]);

  // Update localStorage when currentSource (code from editor) changes
  useEffect(() => {
    if (!user || !currentSource || !decomposedScore) return;

    // Only update if the source has actually changed
    const currentStep =
      step <= decomposedScore.steps.length
        ? decomposedScore.steps[step - 1]
        : null;

    if (currentStep && currentStep.score !== currentSource) {
      saveToLocalStorage(currentSource, currentStep.explanation);
    }
  }, [currentSource, slug, step, user, decomposedScore]);

  if (!decomposedScore) {
    return <GuideContainer>Score not found: {slug}</GuideContainer>;
  }

  const maxSteps = decomposedScore.steps.length;
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
        const lastStep = decomposedScore.steps[maxSteps - 1];
        addNewStep(lastStep.score, "");
      } else {
        onStepChange(step + 1);
      }
    }
  };

  const saveToLocalStorage = (score: string, expl: string) => {
    // Only save if user is logged in
    if (!user) return;

    // Create a copy of the current scores
    const updatedScores = { ...localScores };

    // If this slug doesn't exist yet, create it based on the default template
    if (!updatedScores[slug]) {
      const defaultTemplate = decomposeScores[slug];
      updatedScores[slug] = {
        title: defaultTemplate
          ? defaultTemplate.title
          : `Decomposition ${slug}`,
        steps: defaultTemplate ? [...defaultTemplate.steps] : [],
      };
    }

    // If we're editing an existing step
    if (step <= updatedScores[slug].steps.length) {
      // Update the step
      updatedScores[slug].steps[step - 1] = {
        score,
        explanation: expl,
      };
    } else {
      // Add a new step
      updatedScores[slug].steps.push({
        score,
        explanation: expl,
      });
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScores));

    // Update local state
    setLocalScores(updatedScores);
  };

  const handleExplanationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newExplanation = e.target.value;
    setExplanation(newExplanation);

    if (user && currentStepData) {
      saveToLocalStorage(currentStepData.score, newExplanation);
    }
  };

  const addNewStep = (score: string, expl: string) => {
    const newStep = maxSteps + 1;
    saveToLocalStorage(score, expl);
    onStepChange(newStep);
  };

  const copyToClipboard = () => {
    // Format the data as TypeScript code
    const formattedData = `export const decomposeScores: { [key: string]: DecomposedScore } = ${JSON.stringify(
      localScores,
      null,
      2,
    )};`;

    navigator.clipboard.writeText(formattedData).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
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
          <NavigationButton onClick={handleNextStep}>
            <FontAwesomeIcon icon={faArrowRight} />
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
