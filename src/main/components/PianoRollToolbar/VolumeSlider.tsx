import { withStyles } from "@material-ui/core"
import Slider from "@material-ui/core/Slider"
import { VolumeUp } from "@material-ui/icons"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { theme } from "../../../common/theme/muiTheme"
import { setTrackVolume } from "../../actions"
import { useMemoObserver } from "../../hooks/useMemoObserver"
import { useStores } from "../../hooks/useStores"

const LightSlider = withStyles({
  root: {
    color: theme.palette.primary.contrastText,
    marginLeft: "1rem",
  },
})(Slider)

const Container = styled.div`
  display: flex;
  width: 8rem;
  margin-left: 1rem;
  margin-right: 1rem;
  align-items: center;
`

const VolumeIcon = styled(VolumeUp)`
  color: var(--secondary-text-color);
`

export interface VolumeSliderProps {
  trackId: number
}

const _VolumeSlider: FC<VolumeSliderProps> = ({ trackId }) => {
  const rootStore = useStores()
  const volume = useMemoObserver(
    () =>
      rootStore.song.selectedTrack?.getVolume(
        rootStore.services.player.position
      ) ?? 0
  )
  const onChange = useCallback(
    (value: number) => setTrackVolume(rootStore)(trackId, value),
    [rootStore, trackId]
  )
  return (
    <Container>
      <VolumeIcon />
      <LightSlider
        value={volume}
        onChange={(_, value) => onChange(value as number)}
        max={127}
      />
    </Container>
  )
}

export const VolumeSlider = React.memo(_VolumeSlider)
