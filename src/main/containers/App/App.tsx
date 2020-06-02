import React from "react"
import { Provider } from "mobx-react"

import RootView from "containers/RootView/RootView"
import { bindKeyboardShortcut } from "services/KeyboardShortcut.ts"

import RootStore from "stores/RootStore.ts"
import { theme } from "common/theme/muiTheme"
import { ThemeProvider } from "@material-ui/styles"

import { applyThemeToCSS } from "common/theme/applyThemeToCSS"
import { defaultTheme } from "common/theme"

import "./App.css"
import "./theme.css"
import { ThemeContext } from "main/hooks/useTheme"

const rootStore = new RootStore()

applyThemeToCSS(defaultTheme)

bindKeyboardShortcut(rootStore)

export default function App() {
  return (
    <Provider rootStore={rootStore}>
      <ThemeContext.Provider value={defaultTheme}>
        <ThemeProvider theme={theme}>
          <RootView />
        </ThemeProvider>
      </ThemeContext.Provider>
    </Provider>
  )
}
