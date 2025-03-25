import styled from "styled-components";
import { FOOTER_HEIGHT } from "../../AppFooter";

interface EditorContainerProps {
  height?: string;
}

export const EditorContainer = styled.div<EditorContainerProps>`
  position: relative;
  width: 100%;
  height: ${(props) => props.height || "100%"};
  min-height: 200px;
`;

export const RawlContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
`;

export const EditorPanel = styled.div<{ isFolded: boolean; height?: string }>`
  position: fixed;
  bottom: ${FOOTER_HEIGHT}px;
  left: 0;
  width: calc(100% - 470px); /* Leave space for PianoLegend (about 280px) */
  height: ${(props) => props.height || "50vh"};
  background: #080808;
  display: grid;
  grid-template-columns: 1fr 1fr;
  transition: transform 1s ease;
  transform: translateY(${(props) => (props.isFolded ? "100%" : "0")});
  border-top: 1px solid #333;
  border-right: 1px solid #333;
  z-index: 1000;
  margin-bottom: 0;
  padding-bottom: 0;
`;

export const DebugPanel = styled.div`
  flex: 1;
  background-color: #080808;
  border-right: 1px solid #333;
  padding: 20px;
  overflow: auto;
  color: #d4d4d4;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  font-size: 12px;
`;

export const EditorContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  padding-bottom: 0;
  overflow: auto;
`;

export const CodeMirrorWrapper = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
  isolation: isolate;
  background-color: #080808;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  padding-bottom: 0;

  /* Ensure all CodeMirror elements stay on top */
  & * {
    position: relative;
  }

  .cm-editor {
    position: absolute !important;
    inset: 0;
    height: 100%;
    font-family: "Menlo", "Monaco", "Courier New", monospace;
    font-size: 12px;
    line-height: calc(1.4em + 4px);

    /* Selection styles */
    .cm-selectionBackground {
      background-color: rgba(255, 255, 255, 0.2) !important;
    }

    .cm-focused .cm-selectionBackground {
      background-color: rgba(255, 255, 255, 0.3) !important;
    }

    &::selection,
    *::selection {
      background-color: rgba(255, 255, 255, 0.3) !important;
      color: #ffffff !important;
    }

    .cm-cursor {
      border-left: 1px solid #ffa500 !important;
      border-left-width: 1px !important;
      height: 2em !important;
      margin-top: -0.5em !important;
    }

    .cm-line {
      padding-top: 2px;
      padding-bottom: 2px;
    }
  }

  /* Comment styling */
  .comment {
    color: #666666 !important;
    font-style: italic;
  }

  .cm-scroller,
  .cm-content,
  .cm-line,
  .cm-activeLine,
  .cm-activeLineGutter {
    position: relative;
  }

  .cm-editor .cm-gutters {
    position: relative;
  }

  /* Add padding to gutter line numbers */
  .cm-lineNumbers .cm-gutterElement:not(:first-child) {
    padding-top: 2px;
  }

  /* Command styling:
   * - Regular playback commands (c, ac, i, etc.) use bold styling
   * - Analysis commands (phrases, etc.) use white italic styling (.analysis-command)
   */
  .command-name {
    font-weight: bold;
  }

  /* Analysis command styling - white and italic for all analysis-related commands */
  .analysis-command {
    color: #ffffff !important;
    font-style: italic;
  }

  /* Phrases command diff styling */
  .phrase-diff {
    color: #ffffff !important;
    font-weight: bold;
  }

  .source-span {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }

  .invalid-command {
    text-decoration-color: white;
    opacity: 0.5;
  }

  /* Override text colors for note backgrounds */
  .noteColor_0_colors {
    color: #000000 !important;
    background-color: white !important;
    --background-color: white;
  }
  .noteColor_1_colors {
    color: #ffffff !important;
    background-color: rgb(130, 0, 0) !important;
    --background-color: rgb(130, 0, 0);
  }
  .noteColor_2_colors {
    color: #000000 !important;
    background-color: red !important;
    --background-color: red;
  }
  .noteColor_3_colors {
    color: #ffffff !important;
    background-color: #007000 !important;
    --background-color: #007000;
  }
  .noteColor_4_colors {
    color: #000000 !important;
    background-color: #00fb47 !important;
    --background-color: #00fb47;
  }
  .noteColor_5_colors {
    color: #ffffff !important;
    background-color: #9500b3 !important;
    --background-color: #9500b3;
  }
  .noteColor_6_colors {
    color: #000000 !important;
    background-color: #ea7eff !important;
    --background-color: #ea7eff;
  }
  .noteColor_7_colors {
    color: #000000 !important;
    background-color: rgb(120, 120, 120) !important;
    --background-color: rgb(120, 120, 120);
  }
  .noteColor_8_colors {
    color: #ffffff !important;
    background-color: rgb(0, 0, 255) !important;
    --background-color: rgb(0, 0, 255);
  }
  .noteColor_9_colors {
    color: #000000 !important;
    background-color: #03b9d5 !important;
    --background-color: #03b9d5;
  }
  .noteColor_10_colors {
    color: #ffffff !important;
    background-color: #ff7328 !important;
    --background-color: #ff7328;
  }
  .noteColor_11_colors {
    color: #000000 !important;
    background-color: yellow !important;
    --background-color: yellow;
  }

  /* Add dot styles */
  .dotAbove {
    position: relative;
  }
  .dotAbove::before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 5px solid;
    border-bottom-color: var(--background-color, background-color);
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
  }
  .dotBelow {
    position: relative;
  }
  .dotBelow::before {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid;
    border-top-color: var(--background-color, background-color);
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Remove any potential gaps in the CM scroller */
  .cm-scroller {
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

export const FoldButton = styled.button<{
  position?: "top" | "side";
  isFolded?: boolean;
}>`
  position: absolute;
  background: #080808;
  border: 1px solid #333;
  color: #d4d4d4;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 1001;
  font-size: 14px;

  ${(props) =>
    props.position === "top"
      ? `
    top: -30px;
    left: 0;
    width: 60px;
    height: 30px;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
  `
      : `
    left: -30px;
    top: -1px;
    width: 30px;
    height: 60px;
    border-right: none;
    border-radius: 4px 0 0 4px;
  `}

  &:hover {
    background-color: #2d2d2d;
  }
`;

export const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 11px;
  margin-top: 4px;
`;

export const ResizeHandle = styled.div`
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  height: 6px;
  background: transparent;
  cursor: row-resize;
  z-index: 1001;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

// Export a reusable styled component for colored note letters
export const NoteColorLetter = styled.span`
  /* Override text colors for note backgrounds */
  &.noteColor_0_colors {
    color: #000000 !important;
    background-color: white !important;
    --background-color: white;
  }
  &.noteColor_1_colors {
    color: #ffffff !important;
    background-color: rgb(130, 0, 0) !important;
    --background-color: rgb(130, 0, 0);
  }
  &.noteColor_2_colors {
    color: #000000 !important;
    background-color: red !important;
    --background-color: red;
  }
  &.noteColor_3_colors {
    color: #ffffff !important;
    background-color: #007000 !important;
    --background-color: #007000;
  }
  &.noteColor_4_colors {
    color: #000000 !important;
    background-color: #00fb47 !important;
    --background-color: #00fb47;
  }
  &.noteColor_5_colors {
    color: #ffffff !important;
    background-color: #9500b3 !important;
    --background-color: #9500b3;
  }
  &.noteColor_6_colors {
    color: #000000 !important;
    background-color: #ea7eff !important;
    --background-color: #ea7eff;
  }
  &.noteColor_7_colors {
    color: #000000 !important;
    background-color: rgb(120, 120, 120) !important;
    --background-color: rgb(120, 120, 120);
  }
  &.noteColor_8_colors {
    color: #ffffff !important;
    background-color: rgb(0, 0, 255) !important;
    --background-color: rgb(0, 0, 255);
  }
  &.noteColor_9_colors {
    color: #000000 !important;
    background-color: #03b9d5 !important;
    --background-color: #03b9d5;
  }
  &.noteColor_10_colors {
    color: #ffffff !important;
    background-color: #ff7328 !important;
    --background-color: #ff7328;
  }
  &.noteColor_11_colors {
    color: #000000 !important;
    background-color: yellow !important;
    --background-color: yellow;
  }
`;

export const StatusBar = styled.div`
  padding: 1px 4px;
  color: #888; /* Subtle gray color */
  font-size: 9px;
  font-family: monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 7em;
  text-align: center;
  z-index: 1000;
  pointer-events: none;
`;
