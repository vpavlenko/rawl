import React, { FC } from "react"
import {
  Drawer as MaterialDrawer,
  Divider,
  ListSubheader,
  ListItem,
  ListItemText,
  List,
} from "@material-ui/core"
import { useObserver } from "mobx-react-lite"
import { SongList } from "./SongList"
import { useStores } from "main/hooks/useStores"
import styled from "styled-components"
import { TrackList } from "./TrackList/TrackList"
import { localized } from "../../../common/localize/localizedString"
import Logo from "../../images/logo-white.svg"
import { Help } from "@material-ui/icons"

const BannerContainer = styled.div`
  background: var(--theme-color);
  padding: 0 16px;
  height: 3rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;

  a {
    display: flex;
  }
`

const LogoIcon = styled(Logo)`
  height: 1.4rem;
`

const Banner: FC = () => {
  return (
    <BannerContainer>
      <a href="/">
        <LogoIcon viewBox="0 0 449 120" width={undefined} height={undefined} />
      </a>
    </BannerContainer>
  )
}

const HelpIcon = styled(Help)`
  min-width: auto;
  margin-right: 0.6em;
`

export const Drawer: FC = () => {
  const { rootStore } = useStores()
  const { open, onClose } = useObserver(() => ({
    open: rootStore.rootViewStore.openDrawer,
    onClose: () => (rootStore.rootViewStore.openDrawer = false),
  }))
  return (
    <MaterialDrawer open={open} onClose={onClose}>
      <Banner />
      <SongList />
      <Divider />
      <TrackList />
      <Divider />
      <List>
        <ListItem button onClick={() => (rootStore.router.path = "/tempo")}>
          <ListItemText primary={localized("tempo-track", "Tempo Track")} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={() => (rootStore.rootViewStore.openHelp = true)}
        >
          <HelpIcon />
          <ListItemText primary={localized("help", "Help")} />
        </ListItem>
      </List>
    </MaterialDrawer>
  )
}

export const ListHeader = styled(ListSubheader)`
  &.MuiListSubheader-root {
    background: var(--background-color);
  }
`
