import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import styled from "styled-components";

const ToggleContainer = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
  padding: 2px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
`;

const ToggleIcon = styled.div<{ active: boolean }>`
  color: ${(props) => (props.active ? "white" : "#666")};
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToggleSlider = styled.div`
  width: 32px;
  height: 16px;
  background: #444;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #555;
  }
`;

const SliderKnob = styled.div<{ isRight: boolean }>`
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
  transform: translateX(${(props) => (props.isRight ? "16px" : "0")});
`;

interface ToggleProps {
  leftIcon: IconDefinition;
  rightIcon: IconDefinition;
  isRight: boolean;
  onToggle: () => void;
  leftTitle?: string;
  rightTitle?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  leftIcon,
  rightIcon,
  isRight,
  onToggle,
  leftTitle,
  rightTitle,
}) => {
  return (
    <ToggleContainer>
      <ToggleIcon active={!isRight}>
        <FontAwesomeIcon icon={leftIcon} />
      </ToggleIcon>
      <ToggleSlider onClick={onToggle} title={isRight ? leftTitle : rightTitle}>
        <SliderKnob isRight={isRight} />
      </ToggleSlider>
      <ToggleIcon active={isRight}>
        <FontAwesomeIcon icon={rightIcon} />
      </ToggleIcon>
    </ToggleContainer>
  );
};
