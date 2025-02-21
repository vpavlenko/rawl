import styled from "styled-components";
import { FOOTER_HEIGHT } from "../../AppFooter";

export const EditorContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

export const RawlContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
`;

interface EditorPanelProps {
  isFolded: boolean;
}

export const EditorPanel = styled.div<EditorPanelProps>`
  position: fixed;
  right: 20px;
  bottom: ${FOOTER_HEIGHT}px;
  width: calc(100% - 50px);
  height: 40%;
  background-color: #1e1e1e;
  border-left: 1px solid #333;
  padding: 0px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  z-index: 99999;
  isolation: isolate;
  transform: translateX(${(props) => (props.isFolded ? "100%" : "0")});
  transition: transform 0.3s ease;
`;

export const DebugPanel = styled.div`
  flex: 1;
  background-color: #1e1e1e;
  border-right: 1px solid #333;
  padding: 20px;
  overflow: auto;
  color: #d4d4d4;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  font-size: 12px;
`;

export const EditorContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const CodeMirrorWrapper = styled.div`
  position: relative;
  flex: 1;
  isolation: isolate;
  background-color: #1e1e1e;
  z-index: 100000;

  /* Ensure all CodeMirror elements stay on top */
  & * {
    z-index: 100001;
  }

  .cm-editor {
    position: absolute !important;
    inset: 0;
    height: 100%;
    font-family: "Menlo", "Monaco", "Courier New", monospace;
    font-size: 14px;
    line-height: calc(1.4em + 4px);
    z-index: 100002;

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
    z-index: 100003;
    position: relative;
  }

  .cm-editor .cm-gutters {
    position: relative;
    z-index: 100004;
  }

  /* Add padding to gutter line numbers */
  .cm-lineNumbers .cm-gutterElement:not(:first-child) {
    padding-top: 2px;
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
`;

export const FoldButton = styled.button`
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 60px;
  background: #1e1e1e;
  border: 1px solid #333;
  border-right: none;
  border-radius: 4px 0 0 4px;
  color: #d4d4d4;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2d2d2d;
  }
`;

export const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
`;
