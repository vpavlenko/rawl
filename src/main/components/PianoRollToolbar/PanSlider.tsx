import { withStyles } from "@material-ui/core"
import Slider from "@material-ui/core/Slider"
import React, { FC, useCallback } from "react"
import styled from "styled-components"
import { theme } from "../../../common/theme/muiTheme"
import { setTrackPan } from "../../actions"
import { useMemoObserver } from "../../hooks/useMemoObserver"
import { useStores } from "../../hooks/useStores"

const LightSlider = withStyles({
  root: {
    color: theme.palette.primary.contrastText,
  },
})(Slider)

const Container = styled.div`
  display: flex;
  width: 8rem;
  margin-left: 1rem;
  margin-right: 2rem;
`

const Label = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  color: var(--secondary-text-color);
`

export interface PanSliderProps {
  trackId: number
}

const _PanSlider: FC<PanSliderProps> = ({ trackId }) => {
  const rootStore = useStores()
  const onChange = useCallback(
    (value: number) => setTrackPan(rootStore)(trackId, value),
    [rootStore, trackId]
  )
  const pan = useMemoObserver(
    () =>
      rootStore.song.selectedTrack?.getPan(
        rootStore.services.player.position
      ) ?? 0
  )
  return (
    <Container>
      <Label>Pan</Label>
      <LightSlider
        value={pan}
        onChange={(_, value) => onChange(value as number)}
        min={0}
        max={127}
        defaultValue={64}
        marks={[{ value: 64 }]}
      />
    </Container>
  )
}

export const PanSlider = React.memo(_PanSlider)
