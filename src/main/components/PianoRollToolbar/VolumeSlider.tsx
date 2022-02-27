import styled from "@emotion/styled"
import { VolumeUp } from "@mui/icons-material"
import Slider from "@mui/material/Slider"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import { setTrackVolume } from "../../actions"
import { useStores } from "../../hooks/useStores"

const LightSlider = styled(Slider)`
  color: ${({ theme }) => theme.textColor};
  margin-left: 1rem;
`

const Container = styled.div`
  display: flex;
  width: 8rem;
  margin-left: 1rem;
  margin-right: 1rem;
  align-items: center;
`

const VolumeIcon = styled(VolumeUp)`
  color: ${({ theme }) => theme.secondaryTextColor};
`

export interface VolumeSliderProps {
  trackId: number
}

const _VolumeSlider: FC<VolumeSliderProps> = observer(({ trackId }) => {
  const rootStore = useStores()
  const volume = rootStore.pianoRollStore.currentVolume ?? 100
  const onChange = useCallback(
    (value: number) => setTrackVolume(rootStore)(trackId, value),
    [rootStore, trackId]
  )
  return (
    <Container>
      <VolumeIcon />
      <LightSlider
        size="small"
        value={volume}
        onChange={(_, value) => onChange(value as number)}
        max={127}
      />
    </Container>
  )
})

export const VolumeSlider = React.memo(_VolumeSlider)
