import { hot } from "react-hot-loader/root"
import React from "react"

import { bindKeyboardShortcut } from "main/services/KeyboardShortcut.ts"

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

const rootStore = new RootStore()

bindKeyboardShortcut(rootStore)

function App() {
  return (
    <StoreContext.Provider value={{ rootStore }}>
      <ThemeContext.Provider value={defaultTheme}>
        <ThemeProvider theme={theme}>
          <StylesProvider injectFirst>
            <GlobalCSS />
            <RootView />
          </StylesProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </StoreContext.Provider>
  )
}

export default hot(App)
