import styled from "@emotion/styled"

export const CircleButton = styled.div`
  --webkit-appearance: none;
  outline: none;
  border: none;
  border-radius: 100%;
  margin: 0.25rem;
  padding: 0.4rem;
  color: ${({ theme }) => theme.textColor};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`
