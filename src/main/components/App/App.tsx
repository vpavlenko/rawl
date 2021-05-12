import { StylesProvider } from "@material-ui/core"
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles"
import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
import React from "react"
import { ThemeProvider } from "styled-components"
import { GlobalCSS } from "../../../common/theme/GlobalCSS"
import { theme } from "../../../common/theme/muiTheme"
import { defaultTheme } from "../../../common/theme/Theme"
import { StoreContext } from "../../hooks/useStores"
import { ThemeContext } from "../../hooks/useTheme"
import RootStore from "../../stores/RootStore"
import { GlobalKeyboardShortcut } from "../KeyboardShortcut/GlobalKeyboardShortcut"
import { RootView } from "../RootView/RootView"

Sentry.init({
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  environment: process.env.VERCEL_ENV,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
})

export function App() {
  return (
    <React.StrictMode>
      <StoreContext.Provider value={new RootStore()}>
        <ThemeContext.Provider value={defaultTheme}>
          <ThemeProvider theme={defaultTheme}>
            <MuiThemeProvider theme={theme}>
              <StylesProvider injectFirst>
                <GlobalKeyboardShortcut />
                <GlobalCSS />
                <RootView />
              </StylesProvider>
            </MuiThemeProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </StoreContext.Provider>
    </React.StrictMode>
  )
}
