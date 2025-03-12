import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import Rawl from "./Rawl";

const ContentArea = styled.div<{ isRawlVisible: boolean }>`
  flex-grow: 1;
  height: ${(props) =>
    props.isRawlVisible ? "calc(50vh - 30px)" : "calc(100vh - 30px)"};
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
}

const InlineRawlPlayer: React.FC<InlineRawlPlayerProps> = ({
  children,
  measureStart,
}) => {
  const { currentMidi, rawlProps, saveAnalysis } = useContext(AppContext);
  const [isRawlVisible, setIsRawlVisible] = useState(false);

  useEffect(() => {
    setIsRawlVisible(!!currentMidi);
  }, [currentMidi]);

  return (
    <>
      <ContentArea isRawlVisible={isRawlVisible}>{children}</ContentArea>
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
            latencyCorrectionMs={rawlProps.latencyCorrectionMs}
            sourceUrl={currentMidi.sourceUrl}
            measureStart={measureStart}
            isEmbedded={true}
          />
        </RawlContainer>
      )}
    </>
  );
};

export default InlineRawlPlayer;
