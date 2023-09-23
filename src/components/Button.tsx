import styled from "@emotion/styled"
import Color from "color"

export const Button = styled.button`
  background: transparent;
  border: none;
  border-radius: 0.2rem;
  color: ${({ theme }) => theme.textColor};
  padding: 0.5rem 1rem;
  cursor: pointer;
  height: 2rem;
  outline: none;
  font-size: 0.8rem;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }
  &:active {
    background: ${({ theme }) =>
      Color(theme.secondaryBackgroundColor).lighten(0.1).hex()};
  }
`

export const PrimaryButton = styled(Button)`
  background: ${({ theme }) => theme.themeColor};

  &:hover {
    background: ${({ theme }) => Color(theme.themeColor).darken(0.1).hex()};
  }
  &:active {
    background: ${({ theme }) => Color(theme.themeColor).darken(0.2).hex()};
  }
`
