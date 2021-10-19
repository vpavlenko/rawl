import React from "react"
import { createGlobalStyle } from "styled-components"
import { Layout } from "../../main/Constants"
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
  --key-height: ${Layout.keyHeight}px;
  --key-width: ${Layout.keyWidth}px;
  --ruler-height: ${Layout.rulerHeight}px;
}

html,
body {
  height: 100%;
  margin: 0;
}

body {
  font-size: 80%;
  -webkit-font-smoothing: subpixel-antialiased;
  color: var(--text-color);
  background-color: var(--background-color);
  overscroll-behavior: none;
  font-family: -apple-system, BlinkMacSystemFont, Helvetica Neue, sans-serif;
}

#root {
  height: 100%;
}

div,
label,
button,
canvas,
section,
a,
p,
header,
footer,
ul,
li {
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
}

/* ScrollBar */

.ScrollBar {
  background-color: var(--background-color) !important;
}

.ScrollBar .thumb {
  border: 2px solid rgba(0, 0, 0, 0.2);
  background: var(--secondary-background-color);
}

.ScrollBar .thumb:active,
.ScrollBar .thumb:hover {
  background: var(--tertiary-background-color);
}

.ScrollBar .button-backward:active,
.ScrollBar .button-backward:hover,
.ScrollBar .button-forward:active,
.ScrollBar .button-forward:hover {
  background: var(--tertiary-background-color);
}

.gitter-chat-embed {
  z-index: 10000;
}
`

export const GlobalCSS = () => {
  const theme = useTheme()
  return <GlobalStyle theme={theme} />
}
