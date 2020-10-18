import { withStyles } from "@material-ui/core"
import Slider from "@material-ui/core/Slider"
import { theme } from "common/theme/muiTheme"
import { setTrackPan } from "main/actions"
import { useStores } from "main/hooks/useStores"
import { useObserver } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import styled from "styled-components"

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
  const { rootStore: stores } = useStores()
  const onChange = useCallback(
    (value: number) => setTrackPan(stores)(trackId, value),
    [stores, trackId]
  )
  const pan = useObserver(
    () =>
      stores.song.selectedTrack?.getPan(stores.services.player.position) ?? 0
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
