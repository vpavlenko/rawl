import React, { StatelessComponent } from "react"
import { Drawer } from "@material-ui/core"
import Sidebar from "components/Sidebar/Sidebar"
import { observer, inject } from "mobx-react"
import RootStore from "stores/RootStore"
import { compose } from "recompose"

const PianoRollDrawer: StatelessComponent<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => (
  <Drawer open={open} onClose={onClose}>
    <Sidebar />
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
