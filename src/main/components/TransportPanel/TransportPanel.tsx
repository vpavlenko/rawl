import styled from "@emotion/styled"
import {
  FastForward,
  FastRewind,
  FiberManualRecord,
  Loop,
  Pause,
  PlayArrow,
  Stop,
} from "@mui/icons-material"
import { CircularProgress, Tooltip } from "@mui/material"
import MetronomeIcon from "mdi-react/MetronomeIcon"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { DEFAULT_TEMPO } from "../../../common/player"
import {
  fastForwardOneBar,
  playOrPause,
  rewindOneBar,
  stop,
  toggleEnableLoop,
} from "../../actions"
import { toggleRecording } from "../../actions/recording"
import { useStores } from "../../hooks/useStores"

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 1rem;
  background: ${({ theme }) => theme.backgroundColor};
  border-top: 1px solid ${({ theme }) => theme.dividerColor};
`

const TempoInput = styled.input`
  background: transparent;
  -webkit-appearance: none;
  border: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  width: 5em;
  text-align: center;
  outline: none;
  font-family: "Roboto Mono", monospace;
  font-size: 1rem;
  padding: 0.3rem 0;

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

const Button = styled.div`
  --webkit-appearance: none;
  outline: none;
  border: none;
  border-radius: 100%;
  margin: 0.25rem;
  padding: 0.4rem;
  color: ${({ theme }) => theme.textColor};
  display: flex;
  cursor: pointer;

  &:hover {
    background: #ffffff0d;
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`

const PlayButton = styled(Button)`
  background: ${({ theme }) => theme.themeColor};

  &:hover {
    background: ${({ theme }) => theme.themeColor};
    opacity: 0.8;
  }

  &.active {
    background: ${({ theme }) => theme.themeColor};
  }
`

const RecordButton = styled(Button)`
  &.active {
    color: ${({ theme }) => theme.recordColor};
  }
`

const LoopButton = styled(Button)`
  &.active {
    color: ${({ theme }) => theme.themeColor};
  }
`

const MetronomeButton = styled(Button)`
  &.active {
    color: ${({ theme }) => theme.themeColor};
  }
`

const TempoWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid transparent;
  padding-left: 0.7rem;
  border-radius: 0.25rem;

  label {
    font-size: 0.6rem;
    color: ${({ theme }) => theme.secondaryTextColor};
  }

  &:focus-within {
    border: 1px solid ${({ theme }) => theme.dividerColor};
    background: #ffffff14;
  }
`

const TempoForm: FC = observer(() => {
  const rootStore = useStores()
  const tempo = rootStore.pianoRollStore.currentTempo ?? DEFAULT_TEMPO

  const changeTempo = (tempo: number) => {
    const fixedTempo = Math.max(1, Math.min(512, tempo))
    rootStore.song.conductorTrack?.setTempo(
      fixedTempo,
      rootStore.player.position
    )
    rootStore.player.currentTempo = fixedTempo
  }

  const onKeyPressTempo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  const onChangeTempo = (e: React.ChangeEvent<HTMLInputElement>) =>
    changeTempo(parseFloat(e.target.value))

  return (
    <TempoWrapper>
      <label htmlFor="tempo-input">BPM</label>
      <TempoInput
        type="number"
        id="tempo-input"
        min={1}
        max={1000}
        value={Math.round(tempo * 100) / 100}
        step={1}
        onChange={onChangeTempo}
        onKeyPress={onKeyPressTempo}
      />
    </TempoWrapper>
  )
})

const TimestampText = styled.div`
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondaryTextColor};
`

const Timestamp: FC = observer(() => {
  const { pianoRollStore } = useStores()
  const mbtTime = pianoRollStore.currentMBTTime
  return <TimestampText>{mbtTime}</TimestampText>
})

export const ToolbarSeparator = styled.div`
  background: ${({ theme }) => theme.dividerColor};
  margin: 0.4em 1em;
  width: 1px;
  height: 1rem;
`

export const Right = styled.div`
  position: absolute;
  right: 1em;
`

export const TransportPanel: FC = observer(() => {
  const rootStore = useStores()
  const { player } = rootStore

  const { isPlaying, isMetronomeEnabled, loop } = player
  const isRecording = rootStore.midiRecorder.isRecording
  const canRecording =
    Object.values(rootStore.midiDeviceStore.enabledInputs).filter((e) => e)
      .length > 0
  const isSynthLoading = rootStore.synth.isLoading

  const onClickPlay = playOrPause(rootStore)
  const onClickStop = stop(rootStore)
  const onClickBackward = rewindOneBar(rootStore)
  const onClickForward = fastForwardOneBar(rootStore)
  const onClickRecord = toggleRecording(rootStore)
  const onClickEnableLoop = toggleEnableLoop(rootStore)
  const onClickMetronone = useCallback(() => {
    player.isMetronomeEnabled = !player.isMetronomeEnabled
  }, [player])

  return (
    <Toolbar>
      <Tooltip title={`${localized("rewind", "Rewind")}`} placement="top">
        <Button onClick={onClickBackward}>
          <FastRewind />
        </Button>
      </Tooltip>

      <Tooltip title={`${localized("stop", "Stop")}`} placement="top">
        <Button onClick={onClickStop}>
          <Stop />
        </Button>
      </Tooltip>

      <Tooltip
        title={`${localized("play-pause", "Play/Pause")} [space]`}
        placement="top"
      >
        <PlayButton
          id="button-play"
          onClick={onClickPlay}
          className={isPlaying ? "active" : undefined}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </PlayButton>
      </Tooltip>

      {canRecording && (
        <Tooltip title={`${localized("record", "Record")}`} placement="top">
          <RecordButton
            onClick={onClickRecord}
            className={isRecording ? "active" : undefined}
          >
            <FiberManualRecord />
          </RecordButton>
        </Tooltip>
      )}

      <Tooltip
        title={`${localized("fast-forward", "Fast Forward")}`}
        placement="top"
      >
        <Button onClick={onClickForward}>
          <FastForward />
        </Button>
      </Tooltip>

      {loop && (
        <LoopButton
          onClick={onClickEnableLoop}
          className={loop.enabled ? "active" : undefined}
        >
          <Loop />
        </LoopButton>
      )}

      <ToolbarSeparator />

      <MetronomeButton
        onClick={onClickMetronone}
        className={isMetronomeEnabled ? "active" : undefined}
      >
        <MetronomeIcon />
      </MetronomeButton>

      <TempoForm />

      <ToolbarSeparator />

      <Timestamp />

      {isSynthLoading && (
        <Right>
          <CircularProgress size="1rem" />
        </Right>
      )}
    </Toolbar>
  )
})
