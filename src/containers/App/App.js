import React, { Component } from "react"
import { Provider } from "mobx-react"

import RootView from "../RootView/RootView"

import { bindKeyboardShortcut } from "../../services/KeyboardShortcut"

import RootStore from "../../stores/RootStore"
import Theme from "../../model/Theme"

import "./App.css"

const rootStore = new RootStore()

bindKeyboardShortcut(rootStore.dispatch, rootStore.services.player)

window.addEventListener("load", () => {
  rootStore.rootViewStore.theme = Theme.fromCSS() // load after css has loaded
})

export default function App() {
  return <Provider rootStore={rootStore}>
    <RootView />
  </Provider>
}
