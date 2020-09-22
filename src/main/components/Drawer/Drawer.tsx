import React, { FC } from "react"
import {
  Drawer as MaterialDrawer,
  Divider,
  ListSubheader,
} from "@material-ui/core"
import { useObserver } from "mobx-react"
import TrackList from "containers/TrackList/TrackList"
import { SongListWrapper } from "../../containers/PianoRollEditor/SongList"
import { useStores } from "main/hooks/useStores"
import styled from "styled-components"

export const Drawer: FC = () => {
  const { rootStore } = useStores()
  const { open, onClose } = useObserver(() => ({
    open: rootStore.rootViewStore.openDrawer,
    onClose: () => (rootStore.rootViewStore.openDrawer = false),
  }))
  return (
    <MaterialDrawer open={open} onClose={onClose}>
      <SongListWrapper />
      <Divider />
      <TrackList />
    </MaterialDrawer>
  )
}

export const ListHeader = styled(ListSubheader)`
  background: var(--background-color);
`
