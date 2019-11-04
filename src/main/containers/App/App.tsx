import React from "react"
import { Provider } from "mobx-react"

import RootView from "containers/RootView/RootView"
import { bindKeyboardShortcut } from "services/KeyboardShortcut.ts"

import RootStore from "stores/RootStore.ts"
import themeFromCSS from "helpers/themeFromCSS"
import { theme } from "helpers/muiTheme"
import { ThemeProvider } from "@material-ui/styles"

import "./App.css"
import "./theme.css"

const rootStore = new RootStore()

bindKeyboardShortcut(rootStore.dispatch, rootStore.services.player, rootStore)

window.addEventListener("load", () => {
  rootStore.rootViewStore.theme = themeFromCSS() // load after css has loaded
})

export default function App() {
  return (
    <Provider rootStore={rootStore}>
      <ThemeProvider theme={theme}>
        <RootView />
      </ThemeProvider>
    </Provider>
  )
}
