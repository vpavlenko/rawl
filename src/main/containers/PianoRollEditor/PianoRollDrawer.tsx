import React, { FC } from "react"
import { Drawer, Divider } from "@material-ui/core"
import { useObserver } from "mobx-react"
import TrackList from "containers/TrackList/TrackList"
import { SongListWrapper } from "./SongList"
import { useStores } from "main/hooks/useStores"

const PianoRollDrawer: FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => (
  <Drawer open={open} onClose={onClose}>
    <SongListWrapper />
    <Divider />
    <TrackList />
  </Drawer>
)

const PianoRollDrawerWrapper: FC = () => {
  const { rootStore } = useStores()
  const { openDrawer, onClose } = useObserver(() => ({
    openDrawer: rootStore.rootViewStore.openDrawer,
    onClose: () => (rootStore.rootViewStore.openDrawer = false),
  }))
  return <PianoRollDrawer open={openDrawer} onClose={onClose} />
}

export default PianoRollDrawerWrapper
