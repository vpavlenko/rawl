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
  dispatch: Dispatcher
  routerPath: string
}

const RootView: StatelessComponent<RootViewProps> = ({ song, routerPath }) => {
  const { selectedTrack } = song

  const fileName = path.basename(song.filepath.replace(/\\/g, "/"))

  function withTransporter(content: any) {
    return (
      <Fragment>
        <div className="content">{content}</div>
        <TransportPanel />
      </Fragment>
    )
  }

  function router() {
    switch (routerPath) {
      case "/track":
        return selectedTrack.isConductorTrack
          ? withTransporter(<TempoEditor />)
          : withTransporter(<PianoRollEditor />)
      case "/settings":
        return <SettingsView />
      case "/arrange": /* fallthrough */
      default:
        return (
          <>
            <AppBar position="static">
              <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu">
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6">News</Typography>
                <Button color="inherit">Login</Button>
              </Toolbar>
            </AppBar>
            <Drawer open={true}>
              <Sidebar />
            </Drawer>
            <ArrangeEditor />
            <TransportPanel />
          </>
        )
    }
  }

  return (
    <div className="RootView">
      <Helmet>
        <title>{`${song.name} (${fileName}) ― signal`}</title>
      </Helmet>
      {router()}
    </div>
  )
}

export default compose(
  inject(
    ({
      rootStore: {
        router: { path },
        song,
        services: { player },
        dispatch
      }
    }: {
      rootStore: RootStore
    }) =>
      ({
        routerPath: path,
        song,
        player,
        dispatch
      } as RootViewProps)
  ),
  observer
)(RootView)
