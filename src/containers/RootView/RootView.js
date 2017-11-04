import React from "react"
import { Helmet } from "react-helmet"
import path from "path"
import { observer, inject } from "mobx-react"
import DevTools from "mobx-react-devtools"

import TempoEditor from "../TempoEditor/TempoEditor"
import ArrangeView from "../ArrangeView/ArrangeView"
import TransportPanel from "../TransportPanel/TransportPanel"
import PianoRollEditor from "../PianoRollEditor/PianoRollEditor"

import mainManu from "menus/mainMenu"

import "./Resizer.css"
import "./RootView.css"

const { remote } = window.require("electron")
const { Menu } = remote

function RootView({
  player,
  song,
  dispatch,
  isArrangeViewSelected,
}) {
  const { selectedTrack } = song

  const menu = mainManu(song, dispatch)
  Menu.setApplicationMenu(menu)

  const fileName = path.basename(song.filepath.replace(/\\/g, "/"))

  const content = isArrangeViewSelected ? <ArrangeView /> :
    (selectedTrack.isConductorTrack ? <TempoEditor /> : <PianoRollEditor />)

  return <div className="RootView">
    <Helmet><title>{`${song.name} (${fileName}) ― signal`}</title></Helmet>
    {content}
    <TransportPanel />
    <DevTools />
  </div>
}

export default inject(({ rootStore: { pianoRollStore, rootViewStore, song, services: { player }, dispatch } }) => ({
  isArrangeViewSelected: rootViewStore.isArrangeViewSelected,
  song,
  player,
  dispatch
}))(observer(RootView))
