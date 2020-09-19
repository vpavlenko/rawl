import React, { FC } from "react"
import { withStyles } from "@material-ui/core"
import Slider, { SliderProps } from "@material-ui/core/Slider"
import styled from "styled-components"
import { theme } from "common/theme/muiTheme"

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
  onChange: (value: number) => void
  value: number
}

export const PanSlider: FC<PanSliderProps> = React.memo(
  ({ onChange, value }) => (
    <Container>
      <Label>Pan</Label>
      <LightSlider
        value={value}
        onChange={(_, value) => onChange(value as number)}
        min={0}
        max={127}
        defaultValue={64}
        marks={[{ value: 64 }]}
      />
    </Container>
  )
)
