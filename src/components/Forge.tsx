import * as React from "react";
import { useState } from "react";
import styled from "styled-components";

const ForgeContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const SelectorContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
`;

const Button = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  border: 2px solid #333;
  border-radius: 4px;
  background: ${(props) => (props.active ? "#333" : "transparent")};
  color: ${(props) => (props.active ? "white" : "#333")};
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? "#444" : "#eee")};
  }
`;

const Forge: React.FC = () => {
  const [mode, setMode] = useState<"major" | "minor">("major");

  return (
    <ForgeContainer>
      <h1>Forge</h1>
      <SelectorContainer>
        <Button active={mode === "major"} onClick={() => setMode("major")}>
          Major
        </Button>
        <Button active={mode === "minor"} onClick={() => setMode("minor")}>
          Minor
        </Button>
      </SelectorContainer>
      <div>
        {/* Content will change based on selected mode */}
        {mode === "major" ? (
          <div>Major mode content will go here</div>
        ) : (
          <div>Minor mode content will go here</div>
        )}
      </div>
    </ForgeContainer>
  );
};

export default Forge;
