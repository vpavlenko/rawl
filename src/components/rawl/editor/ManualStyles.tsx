import styled from "styled-components";

export const ToggleButton = styled.button<{ active: boolean }>`
  background-color: ${(props) => (props.active ? "#333" : "transparent")};
  color: ${(props) => (props.active ? "#fff" : "#aaa")};
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background-color: ${(props) => (props.active ? "#444" : "#333")};
  }

  svg {
    font-size: 12px;
  }
`;
