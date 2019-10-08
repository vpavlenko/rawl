import { hot } from "react-hot-loader/root"
import React, { Fragment, StatelessComponent } from "react"
import { Helmet } from "react-helmet"
import path from "path"
import { observer, inject } from "mobx-react"
import {
  AppBar,
  Drawer,
  Toolbar,
  IconButton,
  Typography,
  Button
} from "@material-ui/core"
import { Menu as MenuIcon } from "@material-ui/icons"

import TempoEditor from "containers/TempoEditor/TempoEditor"
import ArrangeEditor from "containers/ArrangeEditor/ArrangeEditor"
import PianoRollEditor from "containers/PianoRollEditor/PianoRollEditor"
import SettingsView from "containers/SettingsView/SettingsView"

import Sidebar from "components/Sidebar/Sidebar"

import { compose } from "recompose"
import Song from "common/song"
import { Dispatcher } from "main/createDispatcher"
import RootStore from "stores/RootStore"

import TransportPanel from "../TransportPanel/TransportPanel"

import "./Resizer.css"
import "./RootView.css"

interface RootViewProps {
  song: Song
}

const RootView: StatelessComponent<RootViewProps> = ({ song }) => {
  const fileName = path.basename(song.filepath.replace(/\\/g, "/"))

  return (
    <div className="RootView">
      <Helmet>
        <title>{`${song.name} (${fileName}) ― signal`}</title>
      </Helmet>
      <PianoRollEditor />
      <TransportPanel />
    </div>
  )
}

export default compose(
  inject(
    ({ rootStore: { song } }: { rootStore: RootStore }) =>
      ({
        song
      } as RootViewProps)
  ),
  observer,
  hot
)(RootView)
