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

interface InlineRawlPlayerProps {
  children: React.ReactNode;
  measureStart?: number;
  onEject?: () => void;
}

const InlineRawlPlayer: React.FC<InlineRawlPlayerProps> = ({
  children,
  measureStart,
  onEject,
}) => {
  const { currentMidi, rawlProps, saveAnalysis, eject, latencyCorrectionMs } =
    useContext(AppContext);

  // Combined eject callback
  const handleEject = () => {
    eject();
    if (onEject) onEject();
  };

  return (
    <>
      <ContentArea>{children}</ContentArea>
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
            isEmbedded={true}
            onEject={handleEject}
          />
        </RawlContainer>
      )}
    </>
  );
};

export default InlineRawlPlayer;
