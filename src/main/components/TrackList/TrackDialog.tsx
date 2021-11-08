import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material"
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

  const [name, setName] = useState(track.name)
  const [channel, setChannel] = useState(track.channel)

  useEffect(() => {
    setName(track.name)
    setChannel(track.channel)
  }, [trackId])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {localized("track", "Track")}: {track.displayName}
      </DialogTitle>
      <DialogContent>
        <TextField
          label={localized("track-name", "Track Name")}
          variant="outlined"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value as string)}
        />
        <FormControl variant="outlined" fullWidth margin="normal">
          <InputLabel id="channel-label">
            {localized("channel", "Channel")}
          </InputLabel>
          <Select
            label={localized("channel", "Channel")}
            labelId="channel-label"
            value={channel}
            onChange={(e) => setChannel(parseInt(e.target.value as string))}
          >
            {range(0, 16).map((v) => (
              <MenuItem key={v} value={v.toString()}>
                {v + 1}
                {v === 9
                  ? ` (${localized("rhythm-track", "Rhythm Track")})`
                  : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          {localized("cancel", "Cancel")}
        </Button>
        <Button
          onClick={() => {
            track.channel = channel
            track.setName(name ?? "")
            onClose()
          }}
        >
          {localized("ok", "OK")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
