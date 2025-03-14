import styled from "styled-components";

export const ManualContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1e1e1e;
  color: #ddd;
  border-left: 1px solid #333;
  font-size: 14px;
`;

export const KeyboardLayout = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #1e1e1e;
  border-right: 1px solid #333;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  flex: 1 1 auto;
  font-size: 12px;
  color: #ccc;
  line-height: 1.6;

  .top-section {
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
  }

  .left-column {
    flex: 0 0 250px;
    margin-right: 5px;
    min-width: 200px;
  }

  .right-column {
    flex: 1;
  }
`;

export const ButtonBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .left-section {
    flex: 1;
    display: flex;
    justify-content: flex-start;
  }

  .center-section {
    flex: 2;
    display: flex;
    justify-content: center;
  }

  .right-section {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
`;

export const RestoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #eee;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background-color: #3a3a3a;
  }

  .icon {
    margin-left: 4px;
  }
`;

export const ViewToggle = styled.div`
  display: flex;
  background-color: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
`;

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

export const TelegramInput = styled.input`
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #eee;
  padding: 6px 12px;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: #666;
  }
`;

export const PublishedUrl = styled.div`
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #eee;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  display: flex;
  align-items: center;

  .copy-button {
    margin-left: 8px;
    opacity: 0.6;
  }

  &:hover .copy-button {
    opacity: 1;
  }
`;

export const PublishButton = styled.button<{
  isPublishing: boolean;
  hasChanges: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${(props) => (props.hasChanges ? "#007bff" : "#333")};
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: ${(props) => (props.isPublishing ? "wait" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.hasChanges ? "#0069d9" : "#444")};
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
