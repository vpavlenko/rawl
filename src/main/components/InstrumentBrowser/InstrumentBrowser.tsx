import styled from "@emotion/styled"
import { CheckedState } from "@radix-ui/react-checkbox"
import { map } from "lodash"
import difference from "lodash/difference"
import groupBy from "lodash/groupBy"
import range from "lodash/range"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { isNotUndefined } from "../../../common/helpers/array"
import {
  categoryEmojis,
  categoryNames,
  getCategoryIndex,
  getInstrumentName,
} from "../../../common/midi/GM"
import { programChangeMidiEvent } from "../../../common/midi/MidiEvent"
import { Button, PrimaryButton } from "../../../components/Button"
import { Checkbox } from "../../../components/Checkbox"
import {
  Dialog,
  DialogActions,
  DialogContent,
} from "../../../components/Dialog"
import { Label } from "../../../components/Label"
import { Localized } from "../../../components/Localized"
import { setTrackInstrument as setTrackInstrumentAction } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { SelectBox } from "./SelectBox"

export interface InstrumentSetting {
  programNumber: number
  isRhythmTrack: boolean
}

export interface InstrumentBrowserProps {
  isOpen: boolean
  setting: InstrumentSetting
  presetCategories: PresetCategory[]
  onChange: (setting: InstrumentSetting) => void
  onClickOK: () => void
  onClickCancel: () => void
}

export interface PresetItem {
  name: string
  programNumber: number
}

export interface PresetCategory {
  name: string
  presets: PresetItem[]
}

const Finder = styled.div`
  display: flex;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`

const Left = styled.div`
  width: 15rem;
  display: flex;
  flex-direction: column;
`

const Right = styled.div`
  width: 21rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Footer = styled.div`
  margin-top: 1rem;
`

const InstrumentBrowser: FC<InstrumentBrowserProps> = ({
  onClickCancel,
  onClickOK,
  isOpen,
  presetCategories,
  onChange,
  setting: { programNumber, isRhythmTrack },
}) => {
  const selectedCategoryId = getCategoryIndex(programNumber)

  const onChangeRhythmTrack = (state: CheckedState) => {
    onChange({ programNumber, isRhythmTrack: state === true })
  }

  const instruments =
    presetCategories.length > selectedCategoryId
      ? presetCategories[selectedCategoryId].presets
      : []

  const categoryOptions = presetCategories.map((preset, i) => ({
    value: i,
    name: preset.name,
  }))

  const instrumentOptions = instruments.map((p) => ({
    value: p.programNumber,
    name: p.name,
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClickCancel}>
      <DialogContent className="InstrumentBrowser">
        <Finder className={isRhythmTrack ? "disabled" : ""}>
          <Left>
            <Label style={{ marginBottom: "0.5rem" }}>
              <Localized default="Categories">categories</Localized>
            </Label>
            <SelectBox
              items={categoryOptions}
              selectedValue={selectedCategoryId}
              onChange={(i) =>
                onChange({
                  programNumber: i * 8, // Choose the first instrument of the category
                  isRhythmTrack,
                })
              }
            />
          </Left>
          <Right>
            <Label style={{ marginBottom: "0.5rem" }}>
              <Localized default="Instruments">instruments</Localized>
            </Label>
            <SelectBox
              items={instrumentOptions}
              selectedValue={programNumber}
              onChange={(programNumber) =>
                onChange({ programNumber, isRhythmTrack })
              }
            />
          </Right>
        </Finder>
        <Footer>
          <Checkbox
            checked={isRhythmTrack}
            onCheckedChange={onChangeRhythmTrack}
            label=<Localized default="Rhythm Track">rhythm-track</Localized>
          />
        </Footer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClickCancel}>
          <Localized default="Cancel">cancel</Localized>
        </Button>
        <PrimaryButton onClick={onClickOK}>
          <Localized default="OK">ok</Localized>
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  )
}

const InstrumentBrowserWrapper: FC = observer(() => {
  const rootStore = useStores()

  const track = rootStore.song.selectedTrack
  const trackId = rootStore.song.selectedTrackId
  const s = rootStore.pianoRollStore
  const player = rootStore.player
  const song = rootStore.song
  const instrumentBrowserSetting =
    rootStore.pianoRollStore.instrumentBrowserSetting
  const openInstrumentBrowser = rootStore.pianoRollStore.openInstrumentBrowser

  if (track === undefined) {
    throw new Error("selectedTrack is undefined")
  }

  const close = () => (s.openInstrumentBrowser = false)
  const setTrackInstrument = (programNumber: number) =>
    setTrackInstrumentAction(rootStore)(trackId, programNumber)

  const presets: PresetItem[] = range(0, 128).map((programNumber) => ({
    programNumber,
    name: getInstrumentName(programNumber)!,
  }))

  const presetCategories = map(
    groupBy(presets, (p) => getCategoryIndex(p.programNumber)),
    (presets, index) => {
      const cat = parseInt(index)
      return { name: categoryEmojis[cat] + " " + categoryNames[cat], presets }
    }
  )

  const onChange = (setting: InstrumentSetting) => {
    const channel = track.channel
    if (channel === undefined) {
      return
    }
    player.sendEvent(programChangeMidiEvent(0, channel, setting.programNumber))
    const noteNumber = 64
    player.startNote({
      noteNumber,
      velocity: 100,
      channel,
    })
    player.stopNote(
      {
        noteNumber,
        channel,
      },
      0.5
    )
    s.instrumentBrowserSetting = setting
  }

  return (
    <InstrumentBrowser
      isOpen={openInstrumentBrowser}
      setting={instrumentBrowserSetting}
      onChange={onChange}
      onClickCancel={() => {
        close()
      }}
      onClickOK={() => {
        if (instrumentBrowserSetting.isRhythmTrack) {
          track.channel = 9
          setTrackInstrument(0)
        } else {
          if (track.isRhythmTrack) {
            // 適当なチャンネルに変える
            const channels = range(16)
            const usedChannels = song.tracks
              .filter((t) => t !== track)
              .map((t) => t.channel)
            const availableChannel =
              Math.min(
                ...difference(channels, usedChannels).filter(isNotUndefined)
              ) || 0
            track.channel = availableChannel
          }
          setTrackInstrument(instrumentBrowserSetting.programNumber)
        }

        close()
      }}
      presetCategories={presetCategories}
    />
  )
})

export default InstrumentBrowserWrapper
