import { range } from "lodash"
import { FC, useEffect, useState } from "react"
import { Button, PrimaryButton } from "../../../components/Button"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { Label } from "../../../components/Label"
import { Localized } from "../../../components/Localized"
import { Select } from "../../../components/Select"
import { TextField } from "../../../components/TextField"
import { useStores } from "../../hooks/useStores"
import { TrackName } from "./TrackName"

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
        <Localized default="Track">track</Localized>:{" "}
        <TrackName track={track} />
      </DialogTitle>
      <DialogContent>
        <Label>
          <Localized default="Track Name">track-name</Localized>
        </Label>
        <TextField
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value as string)}
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <Label>
          <Localized default="Channel">channel</Localized>
        </Label>
        <Select
          value={channel}
          onChange={(e) => setChannel(parseInt(e.target.value as string))}
        >
          {range(0, 16).map((v) => (
            <option key={v} value={v.toString()}>
              {v + 1}
              {v === 9 ? (
                <>
                  {" "}
                  (<Localized default="Rhythm Track">rhythm-track</Localized>)
                </>
              ) : (
                ""
              )}
            </option>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          <Localized default="Cancel">cancel</Localized>
        </Button>
        <PrimaryButton
          onClick={() => {
            track.channel = channel
            track.setName(name ?? "")
            onClose()
          }}
        >
          <Localized default="OK">ok</Localized>
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  )
}
