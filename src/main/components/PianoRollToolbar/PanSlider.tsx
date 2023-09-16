import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback } from "react"
import { Localized } from "../../../components/Localized"
import { Slider } from "../../../components/Slider"
import { setTrackPan } from "../../actions"
import { useStores } from "../../hooks/useStores"

const Container = styled.div`
  display: flex;
  width: 8rem;
  margin-left: 1rem;
  margin-right: 2rem;
`

const Label = styled.div`
  display: flex;
  width: 3rem;
  align-items: center;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.secondaryTextColor};
`

export interface PanSliderProps {
  trackId: number
}

const PAN_CENTER = 64

const _PanSlider: FC<PanSliderProps> = observer(({ trackId }) => {
  const rootStore = useStores()
  const {
    pianoRollStore: { currentPan },
  } = rootStore
  const onChange = useCallback(
    (value: number) => setTrackPan(rootStore)(trackId, value),
    [rootStore, trackId],
  )
  const pan = currentPan ?? PAN_CENTER

  return (
    <Container>
      <Label>
        <Localized default="Pan">pan</Localized>
      </Label>
      <Slider
        value={pan}
        onChange={(value) => onChange(value as number)}
        min={0}
        max={127}
        defaultValue={PAN_CENTER}
        minStepsBetweenThumbs={1}
        marks={[PAN_CENTER]}
      ></Slider>
    </Container>
  )
})

export const PanSlider = React.memo(_PanSlider)
