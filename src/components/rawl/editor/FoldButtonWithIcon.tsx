import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FoldButton } from "./EditorStyles";

interface FoldButtonWithIconProps {
  position?: "top" | "side";
  isFolded: boolean;
  onClick: () => void;
}

export const FoldButtonWithIcon: React.FC<FoldButtonWithIconProps> = ({
  position = "top",
  isFolded,
  onClick,
}) => (
  <FoldButton position={position} isFolded={isFolded} onClick={onClick}>
    <FontAwesomeIcon icon={isFolded ? faChevronUp : faChevronDown} />
  </FoldButton>
);

export default FoldButtonWithIcon;
