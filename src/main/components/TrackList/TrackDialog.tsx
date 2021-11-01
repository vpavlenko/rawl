import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
} from "@material-ui/core"
import { range } from "lodash"
import { useEffect, useState, VFC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"

export interface TrackDialogProps {
  trackId: number
  open: boolean
  onClose: () => void
}

export const TrackDialog: VFC<TrackDialogProps> = ({
  trackId,
  open,
  onClose,
}) => {
  const { song } = useStores()
  const track = song.tracks[trackId]

  const [channel, setChannel] = useState(track.channel)

  useEffect(() => {
    setChannel(track.channel)
  }, [trackId])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {localized("track", "Track")}: {track.displayName}
      </DialogTitle>
      <DialogContent>
        <Select
          style={{
            width: "4em",
          }}
          value={channel}
          onChange={(e) => setChannel(parseInt(e.target.value as string))}
        >
          {range(0, 16).map((v) => (
            <MenuItem value={v.toString()}>CH {v + 1}</MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          {localized("cancel", "Cancel")}
        </Button>
        <Button
          onClick={() => {
            track.channel = channel
            onClose()
          }}
        >
          {localized("ok", "OK")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
