import { Divider, Drawer as MaterialDrawer } from "@material-ui/core"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStores } from "../../hooks/useStores"
import { TrackList } from "./TrackList/TrackList"

export const TrackListDrawer: FC = observer(() => {
  const { rootViewStore } = useStores()
  const open = rootViewStore.openTrackListDrawer
  const close = () => (rootViewStore.openTrackListDrawer = false)

  return (
    <MaterialDrawer open={open} onClose={close}>
      <Divider />
      <TrackList />
    </MaterialDrawer>
  )
})
