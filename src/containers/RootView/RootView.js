import React, { Fragment } from "react"
import { Helmet } from "react-helmet"
import path from "path"
import { observer, inject } from "mobx-react"
import DevTools from "mobx-react-devtools"

import TempoEditor from "containers/TempoEditor/TempoEditor"
import ArrangeView from "containers/ArrangeView/ArrangeView"
import TransportPanel from "containers/TransportPanel/TransportPanel"
import PianoRollEditor from "containers/PianoRollEditor/PianoRollEditor"
import SettingsView from "containers/SettingsView/SettingsView"

import Sidebar from "components/Sidebar/Sidebar"

import mainManu from "menus/mainMenu"
import isDev from "helpers/isDev"

import "./Resizer.css"
import "./RootView.css"

const { remote } = window.require("electron")
const { Menu } = remote

function RootView({
  player,
  song,
  dispatch,
  routerPath,
}) {
  const { selectedTrack } = song

  const menu = mainManu(song, dispatch)
  Menu.setApplicationMenu(menu)

  const fileName = path.basename(song.filepath.replace(/\\/g, "/"))

  function withTransporter(content) {
    return <Fragment>
      <div className="content">
        <Sidebar />
        {content}
      </div>
      <TransportPanel />
    </Fragment>
  }

  function router() {
    switch (routerPath) {
      case "/track": return selectedTrack.isConductorTrack ? withTransporter(<TempoEditor />) : withTransporter(<PianoRollEditor />)
      case "/settings": return <SettingsView />
      case "/arrange": /* fallthrough */
      default:
        return withTransporter(<ArrangeView />)
    }
  }

  return <div className="RootView">
    <Helmet><title>{`${song.name} (${fileName}) ― signal`}</title></Helmet>
    {router()}
    {isDev() && <DevTools />}
  </div>
}

export default inject(({ rootStore: { pianoRollStore, router: { path }, song, services: { player }, dispatch } }) => ({
  routerPath: path,
  song,
  player,
  dispatch
}))(observer(RootView))
