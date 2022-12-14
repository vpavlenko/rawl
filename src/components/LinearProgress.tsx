import styled from "@emotion/styled"

export const LinearProgress = styled.progress`
  width: 100%;
  -moz-appearance: none;
  -webkit-appearance: none;
  background: ${({ theme }) => theme.secondaryBackgroundColor};

  &::-webkit-progress-bar {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
    border-radius: 0.25rem;
    height: 0.5rem;
  }

  &::-webkit-progress-value {
    background: ${({ theme }) => theme.themeColor};
    border-radius: 0.25rem;
    height: 100%;
  }

  /* Firefox */
  border: none;
  border-radius: 0.25rem;
  height: 0.5rem;
  box-sizing: border-box;

  &::-moz-progress-bar {
    background: ${({ theme }) => theme.themeColor};
    border-radius: 0.25rem;
    height: 100%;
  }
`
