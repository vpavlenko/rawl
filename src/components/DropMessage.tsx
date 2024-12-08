import * as React from "react";
import styled from "styled-components";

const MessageBoxOuter = styled.div`
  position: absolute;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  pointer-events: none;
  top: 0;
  left: 0;
  padding: var(--charH) var(--charW2);
  box-sizing: border-box;

  &[hidden] {
    visibility: hidden;
  }
`;

const MessageBox = styled.div`
  background-color: var(--button);
  padding: var(--charH) var(--charW2);
  box-shadow: var(--charW1) var(--charW1) var(--shadow);
  box-sizing: border-box;
  display: flex;
  transition: all 250ms steps(5);
  visibility: visible;
  overflow: hidden;
  max-height: 100%;
  pointer-events: all;
  flex-direction: column;
  width: calc(90 * var(--charW1));
  height: calc(40 * var(--charH));

  &[hidden] {
    width: 0;
    height: 0;
    visibility: hidden;

    .message-box-inner {
      overflow: hidden;
    }
  }

  &.drop-message {
    height: calc(9 * var(--charH) + 1px);
    width: calc(60 * var(--charW1));
    text-align: center;
  }
`;

const MessageBoxInner = styled.div`
  color: var(--clickable);
  border: 1px solid var(--clickable);
  padding: var(--charH) var(--charW2);
  overflow: auto;
  scrollbar-gutter: stable;

  &:hover {
    scrollbar-gutter: stable;
  }

  .drop-message & {
    overflow: hidden;
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }
`;

const DropMessage: React.FC<{
  dropzoneProps: {
    isDragActive: boolean;
  };
}> = ({ dropzoneProps }) => (
  <MessageBoxOuter hidden={!dropzoneProps.isDragActive}>
    <MessageBox hidden={!dropzoneProps.isDragActive} className="drop-message">
      <MessageBoxInner>Drop a MIDI file to play.</MessageBoxInner>
    </MessageBox>
  </MessageBoxOuter>
);

export default React.memo(DropMessage);
