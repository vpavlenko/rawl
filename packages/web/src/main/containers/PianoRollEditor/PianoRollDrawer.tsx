import React, { StatelessComponent } from "react"
import { Drawer } from "@material-ui/core"
import { observer, inject } from "mobx-react"
import RootStore from "stores/RootStore"
import { compose } from "recompose"
import TrackList from "containers/TrackList/TrackList"

const PianoRollDrawer: StatelessComponent<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => (
  <Drawer open={open} onClose={onClose}>
    <TrackList />
  </Drawer>
)

export default compose(
  inject(({ rootStore: { pianoRollStore: s } }: { rootStore: RootStore }) => {
    return {
      open: s.openDrawer,
      onClose: () => (s.openDrawer = false)
    }
  }),
  observer
)(PianoRollDrawer)
