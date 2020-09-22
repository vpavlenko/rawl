import React, { FC } from "react"
import { Drawer, Divider, ListSubheader } from "@material-ui/core"
import { useObserver } from "mobx-react"
import TrackList from "containers/TrackList/TrackList"
import { SongListWrapper } from "./SongList"
import { useStores } from "main/hooks/useStores"
import styled from "styled-components"

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

export const PianoRollDrawerWrapper: FC = () => {
  const { rootStore } = useStores()
  const { openDrawer, onClose } = useObserver(() => ({
    openDrawer: rootStore.rootViewStore.openDrawer,
    onClose: () => (rootStore.rootViewStore.openDrawer = false),
  }))
  return <PianoRollDrawer open={openDrawer} onClose={onClose} />
}

export const ListHeader = styled(ListSubheader)`
  background: var(--background-color);
`
