import React, { StatelessComponent } from "react"
import { withStyles } from "@material-ui/core"
import { VolumeUp } from "@material-ui/icons"
import Slider, { SliderProps } from "@material-ui/core/Slider"
import styled from "styled-components"
import { theme } from "helpers/muiTheme"

const LightSlider = withStyles({
  root: {
    color: theme.palette.primary.contrastText
  }
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
`

export const PanSlider: StatelessComponent<SliderProps> = props => (
  <Container>
    <Label>Pan</Label>
    <LightSlider
      {...props}
      min={0}
      max={127}
      defaultValue={64}
      marks={[{ value: 64 }]}
    />
  </Container>
)
