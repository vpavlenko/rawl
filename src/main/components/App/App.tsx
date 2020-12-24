import { StylesProvider } from "@material-ui/core"
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles"
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
