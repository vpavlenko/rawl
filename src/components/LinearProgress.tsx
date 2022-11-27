import styled from "@emotion/styled"

export const LinearProgress = styled.progress`
  width: 100%;
  -webkit-appearance: none;

  &::-webkit-progress-bar {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
    border-radius: 0.25rem;
    height: 0.5rem;
  }

  &::-webkit-progress-value {
    background: ${({ theme }) => theme.themeColor};
    border-radius: 0.25rem;
    height: 0.5rem;
  }
`
