import React, { StatelessComponent } from "react"
import { Drawer, Divider } from "@material-ui/core"
import { observer, inject } from "mobx-react"
import RootStore from "stores/RootStore"
import { compose } from "recompose"
import TrackList from "containers/TrackList/TrackList"
import SongList from "./SongList"

const PianoRollDrawer: StatelessComponent<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => (
  <Drawer open={open} onClose={onClose}>
    <SongList />
    <Divider />
    <TrackList />
  </Drawer>
)

export default compose(
  inject(({ rootStore: { rootViewStore: s } }: { rootStore: RootStore }) => {
    return {
      open: s.openDrawer,
      onClose: () => (s.openDrawer = false)
    }
  }),
  observer
)(PianoRollDrawer)
