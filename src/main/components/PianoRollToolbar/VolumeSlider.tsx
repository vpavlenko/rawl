import React, { StatelessComponent } from "react"
import { withStyles } from "@material-ui/core"
import { VolumeUp } from "@material-ui/icons"
import Slider, { SliderProps } from "@material-ui/core/Slider"
import styled from "styled-components"
import { theme } from "helpers/muiTheme"

const LightSlider = withStyles({
  root: {
    color: theme.palette.primary.contrastText,
    marginLeft: "1rem"
  }
})(Slider)

const Container = styled.div`
  display: flex;
  width: 8rem;
  margin-left: 1rem;
  margin-right: 1rem;
`

export const VolumeSlider: StatelessComponent<SliderProps> = props => (
  <Container>
    <VolumeUp />
    <LightSlider {...props} max={127} />
  </Container>
)
