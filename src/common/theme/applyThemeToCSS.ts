import { Theme } from "./Theme"

export const applyThemeToCSS = (theme: Theme) => {
  const css = `
    :root {
      --theme-color: ${theme.themeColor};
      --text-color: ${theme.textColor};
      --secondary-text-color: ${theme.secondaryTextColor};
      --tertiary-text-color: ${theme.tertiaryTextColor};
      --divider-color: ${theme.dividerColor};
      --background-color: ${theme.backgroundColor};
      --secondary-background-color: ${theme.secondaryBackgroundColor};
      --tertiary-background-color: ${theme.tertiaryBackgroundColor};
      --key-height: ${theme.keyHeight}px;
      --key-width: ${theme.keyWidth}px;
      --ruler-height: ${theme.rulerHeight}px;
    }
  `
  const style = document.createElement("style")
  style.type = "text/css"
  style.appendChild(document.createTextNode(css))
  document.head.appendChild(style)
}
