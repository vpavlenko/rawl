import { Drawer as MaterialDrawer, ListSubheader } from "@material-ui/core"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import styled from "styled-components"
import { useStores } from "../../hooks/useStores"
import { SongList } from "./SongList"

export const Drawer: FC = observer(() => {
  const { rootViewStore } = useStores()
  const open = rootViewStore.openDrawer
  const close = () => (rootViewStore.openDrawer = false)

  return (
    <MaterialDrawer open={open} onClose={close}>
      <SongList />
    </MaterialDrawer>
  )
})

export const ListHeader = styled(ListSubheader)`
  &.MuiListSubheader-root {
    background: var(--background-color);
  }
`
