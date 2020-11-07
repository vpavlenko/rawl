import { StylesProvider } from "@material-ui/core"
import { ThemeProvider } from "@material-ui/styles"
import React from "react"
import { GlobalCSS } from "../../../common/theme/GlobalCSS"
import { theme } from "../../../common/theme/muiTheme"
import { defaultTheme } from "../../../common/theme/Theme"
import { StoreContext } from "../../hooks/useStores"
import { ThemeContext } from "../../hooks/useTheme"
import { KeyboardShortcut } from "../../services/KeyboardShortcut"
import RootStore from "../../stores/RootStore"
import { RootView } from "../RootView/RootView"
import "./App.css"

export function App() {
  return (
    <React.StrictMode>
      <StoreContext.Provider value={new RootStore()}>
        <ThemeContext.Provider value={defaultTheme}>
          <ThemeProvider theme={theme}>
            <StylesProvider injectFirst>
              <KeyboardShortcut />
              <GlobalCSS />
              <RootView />
            </StylesProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </StoreContext.Provider>
    </React.StrictMode>
  )
}
