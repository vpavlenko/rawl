import React from "react"
import { createGlobalStyle } from "styled-components"
import { useTheme } from "../../main/hooks/useTheme"
import { Theme } from "./Theme"

interface ThemeStyleProps {
  theme: Theme
}

const GlobalStyle = createGlobalStyle<ThemeStyleProps>`
:root {
  --theme-color: ${({ theme }) => theme.themeColor};
  --text-color: ${({ theme }) => theme.textColor};
  --secondary-text-color: ${({ theme }) => theme.secondaryTextColor};
  --tertiary-text-color: ${({ theme }) => theme.tertiaryTextColor};
  --divider-color: ${({ theme }) => theme.dividerColor};
  --background-color: ${({ theme }) => theme.backgroundColor};
  --secondary-background-color: ${({ theme }) =>
    theme.secondaryBackgroundColor};
  --tertiary-background-color: ${({ theme }) => theme.tertiaryBackgroundColor};
  --key-height: ${({ theme }) => theme.keyHeight}px;
  --key-width: ${({ theme }) => theme.keyWidth}px;
  --ruler-height: ${({ theme }) => theme.rulerHeight}px;
}
`

export const GlobalCSS = () => {
  const theme = useTheme()
  return <GlobalStyle theme={theme} />
}
