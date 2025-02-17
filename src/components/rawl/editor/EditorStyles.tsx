import styled from "styled-components";

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
  bottom: 80px;
  width: 50%;
  height: 40%;
  background-color: #1e1e1e;
  border-left: 1px solid #333;
  padding: 0px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 99999;
  isolation: isolate;
  transform: translateX(${(props) => (props.isFolded ? "100%" : "0")});
  transition: transform 0.3s ease;
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
  }
  .noteColor_1_colors {
    color: #ffffff !important;
  }
  .noteColor_2_colors {
    color: #000000 !important;
  }
  .noteColor_3_colors {
    color: #ffffff !important;
  }
  .noteColor_4_colors {
    color: #000000 !important;
  }
  .noteColor_5_colors {
    color: #ffffff !important;
  }
  .noteColor_6_colors {
    color: #000000 !important;
  }
  .noteColor_7_colors {
    color: #000000 !important;
  }
  .noteColor_8_colors {
    color: #ffffff !important;
  }
  .noteColor_9_colors {
    color: #000000 !important;
  }
  .noteColor_10_colors {
    color: #000000 !important;
  }
  .noteColor_11_colors {
    color: #000000 !important;
  }

  /* Add dot styles */
  .dotAbove {
    position: relative;
  }
  .dotAbove::before {
    content: " ̑";
    position: absolute;
    color: white;
    top: -0.7em;
    left: 50%;
    transform: translateX(-50%);
  }
  .dotBelow {
    position: relative;
  }
  .dotBelow::before {
    content: "˘";
    position: absolute;
    color: white;
    bottom: -1.15em;
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
