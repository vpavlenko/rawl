import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import Rawl from "./Rawl";

const ContentArea = styled.div`
  flex-grow: 1;
  height: calc(50vh - 30px);
  overflow-y: auto;
  transition: height 0.3s ease-in-out;
`;

const RawlContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background-color: #000;
  z-index: 200000;
  overflow: auto;
`;

const EjectButton = styled.button`
  position: fixed;
  bottom: 50vh;
  right: 0;
  background: #333;
  color: white;
  border: none;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  z-index: 200001;
  transition: background-color 0.2s;
  font-size: 16px;

  &:hover { background: #444; }
`;

interface InlineRawlPlayerProps {
  children?: React.ReactNode;
  contentRef?: React.Ref<HTMLDivElement>;
  measureStart?: number;
  playAfterSeek?: boolean;
  onEject?: () => void;
}

const InlineRawlPlayer: React.FC<InlineRawlPlayerProps> = ({
  children,
  contentRef,
  measureStart,
  playAfterSeek,
  onEject,
}) => {
  const { currentMidi, rawlProps, saveAnalysis, eject, latencyCorrectionMs } =
    useContext(AppContext);

  // Combined eject callback
  const handleEject = () => {
    if (onEject) onEject();
    eject();
  };

  return (
    <>
      {children && <ContentArea ref={contentRef}>{children}</ContentArea>}
      {currentMidi && (
        <EjectButton type="button" onClick={handleEject} aria-label="Close example" title="Close example">
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </EjectButton>
      )}
      {currentMidi && rawlProps && rawlProps?.parsingResult && (
        <RawlContainer>
          <Rawl
            parsingResult={rawlProps.parsingResult}
            getCurrentPositionMs={rawlProps.getCurrentPositionMs}
            savedAnalysis={rawlProps.savedAnalysis}
            saveAnalysis={saveAnalysis}
            voiceNames={rawlProps.voiceNames}
            voiceMask={rawlProps.voiceMask}
            setVoiceMask={rawlProps.setVoiceMask}
            enableManualRemeasuring={rawlProps.enableManualRemeasuring}
            seek={rawlProps.seek}
            latencyCorrectionMs={latencyCorrectionMs}
            sourceUrl={currentMidi.sourceUrl}
            measureStart={measureStart}
            playAfterSeek={playAfterSeek}
            isEmbedded={true}
            onEject={handleEject}
          />
        </RawlContainer>
      )}
    </>
  );
};

export default InlineRawlPlayer;
