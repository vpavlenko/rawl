import React from "react"
import { Provider } from "mobx-react"

import RootView from "containers/RootView/RootView"
import { bindKeyboardShortcut } from "services/KeyboardShortcut.ts"

import RootStore from "stores/RootStore.ts"
import { themeFromCSS } from "model/Theme"

import "./App.css"
import "./theme.css"

const rootStore = new RootStore()

bindKeyboardShortcut(rootStore.dispatch, rootStore.services.player, rootStore)

window.addEventListener("load", () => {
  rootStore.rootViewStore.theme = themeFromCSS() // load after css has loaded
})

export default function App() {
  return <Provider rootStore={rootStore}>
    <RootView />
  </Provider>
}
