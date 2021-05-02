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
import { KeyboardShortcut } from "../../services/KeyboardShortcut"
import RootStore from "../../stores/RootStore"
import { RootView } from "../RootView/RootView"

Sentry.init({
  dsn:
    "https://aefd54e0ed274a2d89bf8f808f6ef9e5@o571364.ingest.sentry.io/5719392",
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
                <KeyboardShortcut />
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
