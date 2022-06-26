import styled from "@emotion/styled"
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from "@mui/material"
import { map } from "lodash"
import difference from "lodash/difference"
import groupBy from "lodash/groupBy"
import range from "lodash/range"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { isNotUndefined } from "../../../common/helpers/array"
import { localized } from "../../../common/localize/localizedString"
import {
  categoryEmojis,
  categoryNames,
  getCategoryIndex,
  getInstrumentName,
} from "../../../common/midi/GM"
import { programChangeMidiEvent } from "../../../common/midi/MidiEvent"
import { setTrackInstrument as setTrackInstrumentAction } from "../../actions"
import { useStores } from "../../hooks/useStores"

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

  .left label,
  .right label {
    padding: 0.5em 1em;
    display: block;
  }

  .left select {
    width: 15em;
  }

  .right select {
    width: 21em;
  }
`

const Select = styled.select`
  overflow: auto;
  background-color: #00000024;
  border: 1px solid ${({ theme }) => theme.dividerColor};

  &:focus {
    outline: ${({ theme }) => theme.themeColor} 1px solid;

    option:checked {
      box-shadow: 0 0 10px 100px ${({ theme }) => theme.themeColor} inset;
    }
  }
`

const Option = styled.option`
  padding: 0.5em 1em;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textColor};
  height: 1.2rem;

  &:checked {
    background: ${({ theme }) => theme.themeColor};
    box-shadow: none;
  }
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

  const onChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      programNumber: e.target.selectedIndex * 8, // カテゴリの最初の楽器を選ぶ -> Choose the first instrument of the category
      isRhythmTrack,
    })
  }

  const onChangeInstrument = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      programNumber: parseInt(e.target.value),
      isRhythmTrack,
    })
  }

  const onChangeRhythmTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ programNumber, isRhythmTrack: e.target.checked })
  }

  const instruments =
    presetCategories.length > selectedCategoryId
      ? presetCategories[selectedCategoryId].presets
      : []

  const categoryOptions = presetCategories.map(
    (preset: PresetCategory, i: number) => {
      return (
        <Option key={i} value={i}>
          {preset.name}
        </Option>
      )
    }
  )

  const instrumentOptions = instruments.map((p: PresetItem, i: number) => {
    return (
      <Option key={i} value={p.programNumber}>
        {p.name}
      </Option>
    )
  })

  return (
    <Dialog open={isOpen} onClose={onClickCancel}>
      <DialogContent className="InstrumentBrowser">
        <Finder className={isRhythmTrack ? "disabled" : ""}>
          <div className="left">
            <label>{localized("categories", "Categories")}</label>
            <Select
              size={12}
              onChange={onChangeCategory}
              value={selectedCategoryId}
            >
              {categoryOptions}
            </Select>
          </div>
          <div className="right">
            <label>{localized("instruments", "Instruments")}</label>
            <Select
              size={12}
              onChange={onChangeInstrument}
              value={programNumber}
            >
              {instrumentOptions}
            </Select>
          </div>
        </Finder>
        <div className="footer">
          <FormControlLabel
            control={
              <Checkbox
                checked={isRhythmTrack}
                onChange={onChangeRhythmTrack}
                color="primary"
              />
            }
            label={localized("rhythm-track", "Rhythm Track")}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClickCancel}>{localized("cancel", "Cancel")}</Button>
        <Button color="primary" onClick={onClickOK}>
          {localized("ok", "OK")}
        </Button>
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
    player.playNote({
      duration: 240,
      noteNumber: 64,
      velocity: 100,
      channel,
    })
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
