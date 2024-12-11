import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import styled from "styled-components";

const DropBox = styled.div`
  border: 4px dashed #0f0; /* Neon green dashed border */
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  transition: all 0.2s ease-in-out;
  background: #000; /* Black background */
  box-shadow: 0 0 10px #0f0; /* Neon glow effect */
`;

const Icon = styled(FontAwesomeIcon)`
  font-size: 48px;
  color: #0f0; /* Neon green color */
`;

const Text = styled.p`
  margin-top: 15px;
  font-size: 16px;
  color: #0f0; /* Neon green text */
`;

export const FileDropBox: React.FC = () => (
  <DropBox>
    <Icon icon={faMusic} />
    <Text>Drag & Drop your MIDI files here (or anywhere really)</Text>
  </DropBox>
);
