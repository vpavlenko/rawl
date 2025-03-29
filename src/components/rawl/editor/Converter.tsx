import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { convertSourceToVersions } from "./sourceConverter";

const ConverterContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  color: #fff;
`;

const TextareasContainer = styled.div`
  display: flex;
  gap: 20px;
  height: 70vh;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TextareaColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-size: 16px;
  color: #fff;
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: #1e1e1e;
  color: #e0e0e0;
  border: 1px solid #444;
  border-radius: 4px;
  resize: none;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #3a3a3a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #4a4a4a;
  }
`;

// Helper function to convert source text without modifying a document
const convertSourceText = (source: string): string => {
  // Create a temporary document object
  const tempDoc: { source: string; versions: string[] } = {
    source,
    versions: [],
  };

  // Convert the source
  convertSourceToVersions(tempDoc);

  // Return the first version (the converted text)
  return tempDoc.versions[0] || "";
};

const Converter: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  // Convert input text whenever it changes
  useEffect(() => {
    if (inputText) {
      setOutputText(convertSourceText(inputText));
    } else {
      setOutputText("");
    }
  }, [inputText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleClearClick = () => {
    setInputText("");
    setOutputText("");
  };

  const handleCopyClick = () => {
    if (outputText) {
      navigator.clipboard
        .writeText(outputText)
        .then(() => {
          alert("Converted text copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  return (
    <ConverterContainer>
      <Title>Notation Converter</Title>
      <TextareasContainer>
        <TextareaColumn>
          <Label>Old Notation (Input)</Label>
          <StyledTextarea
            value={inputText}
            onChange={handleInputChange}
            placeholder="Paste your old notation here..."
          />
        </TextareaColumn>

        <TextareaColumn>
          <Label>New Notation (Output)</Label>
          <StyledTextarea
            value={outputText}
            readOnly
            placeholder="Converted notation will appear here..."
          />
        </TextareaColumn>
      </TextareasContainer>

      <ButtonsContainer>
        <Button onClick={handleClearClick}>Clear</Button>
        <Button onClick={handleCopyClick} disabled={!outputText}>
          Copy to Clipboard
        </Button>
      </ButtonsContainer>
    </ConverterContainer>
  );
};

export default Converter;
