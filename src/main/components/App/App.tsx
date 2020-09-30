import React from "react"

import { KeyboardShortcut } from "../../services/KeyboardShortcut"

import RootStore from "stores/RootStore.ts"
import { theme } from "common/theme/muiTheme"
import { ThemeProvider } from "@material-ui/styles"

import { GlobalCSS } from "common/theme/GlobalCSS"
import { defaultTheme } from "common/theme/Theme"
import { ThemeContext } from "main/hooks/useTheme"
import { StoreContext } from "main/hooks/useStores"
import { RootView } from "../RootView/RootView"

import "./App.css"
import { StylesProvider } from "@material-ui/core"

export function App() {
  return (
    <StoreContext.Provider value={{ rootStore: new RootStore() }}>
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
  )
}
