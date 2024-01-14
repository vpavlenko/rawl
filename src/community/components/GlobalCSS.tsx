import { css, Global } from "@emotion/react"
import { useTheme } from "../../main/hooks/useTheme"

export const GlobalCSS = () => {
  const theme = useTheme()
  return (
    <Global
      styles={css`
        html {
          font-size: 16px;
        }

        html,
        body {
          height: 100%;
          margin: 0;
        }

        body {
          -webkit-font-smoothing: subpixel-antialiased;
          color: ${theme.textColor};
          background-color: ${theme.backgroundColor};
          overscroll-behavior: none;
          font-family: ${theme.font};
          font-size: 0.75rem;
        }

        #root {
          height: 100%;
        }

        /* firebase */
        .firebase-emulator-warning {
          width: auto !important;
        }
      `}
    />
  )
}
