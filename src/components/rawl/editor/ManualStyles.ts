export const ToggleButton = styled.button<{ active: boolean }>`
  background-color: ${(props) => (props.active ? "#333" : "transparent")};
  color: ${(props) => (props.active ? "#fff" : "#aaa")};
  border: 1px solid ${(props) => (props.active ? "#555" : "#444")};
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not([disabled]) {
    background-color: ${(props) => (props.active ? "#333" : "#222")};
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${(props) => (props.active ? "#333" : "transparent")};
    color: ${(props) => (props.active ? "#aaa" : "#666")};
  }

  svg {
    font-size: 12px;
  }
`;
