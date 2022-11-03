import styled from "@emotion/styled"
import {
  FastForward,
  FastRewind,
  FiberManualRecord,
  Loop,
  Stop,
} from "@mui/icons-material"
import { CircularProgress, Tooltip } from "@mui/material"
import MetronomeIcon from "mdi-react/MetronomeIcon"
import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import {
  fastForwardOneBar,
  playOrPause,
  rewindOneBar,
  stop,
  toggleEnableLoop,
} from "../../actions"
import { toggleRecording } from "../../actions/recording"
import { useStores } from "../../hooks/useStores"
import { CircleButton } from "./CircleButton"
import { PlayButton } from "./PlayButton"
import { TempoForm } from "./TempoForm"

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 1rem;
  background: ${({ theme }) => theme.backgroundColor};
  border-top: 1px solid ${({ theme }) => theme.dividerColor};
  height: 3rem;
  box-sizing: border-box;
`

const RecordButton = styled(CircleButton)`
  &.active {
    color: ${({ theme }) => theme.recordColor};
  }
`

const LoopButton = styled(CircleButton)`
  &.active {
    color: ${({ theme }) => theme.themeColor};
  }
`

const MetronomeButton = styled(CircleButton)`
  &.active {
    color: ${({ theme }) => theme.themeColor};
  }
`

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
        <CircleButton onClick={onClickBackward}>
          <FastRewind />
        </CircleButton>
      </Tooltip>

      <Tooltip title={`${localized("stop", "Stop")}`} placement="top">
        <CircleButton onClick={onClickStop}>
          <Stop />
        </CircleButton>
      </Tooltip>

      <Tooltip
        title={`${localized("play-pause", "Play/Pause")} [space]`}
        placement="top"
      >
        <PlayButton onClick={onClickPlay} isPlaying={isPlaying} />
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
        <CircleButton onClick={onClickForward}>
          <FastForward />
        </CircleButton>
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
