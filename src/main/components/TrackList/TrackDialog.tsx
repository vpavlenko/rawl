import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material"
import { range } from "lodash"
import { FC, useEffect, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { Button, PrimaryButton } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { useStores } from "../../hooks/useStores"

export interface TrackDialogProps {
  trackId: number
  open: boolean
  onClose: () => void
}

export const TrackDialog: FC<TrackDialogProps> = ({
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
    <Dialog open={open} onOpenChange={onClose} style={{ minWidth: "20rem" }}>
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
        <PrimaryButton
          onClick={() => {
            track.channel = channel
            track.setName(name ?? "")
            onClose()
          }}
        >
          {localized("ok", "OK")}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  )
}
