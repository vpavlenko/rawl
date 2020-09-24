import React, { FC } from "react"
import { withStyles } from "@material-ui/core"
import { VolumeUp } from "@material-ui/icons"
import Slider from "@material-ui/core/Slider"
import styled from "styled-components"
import { theme } from "common/theme/muiTheme"

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
  onChange: (value: number) => void
  value: number
}

export const VolumeSlider: FC<VolumeSliderProps> = React.memo(
  ({ onChange, value }) => (
    <Container>
      <VolumeIcon />
      <LightSlider
        value={value}
        onChange={(_, value) => onChange(value as number)}
        max={127}
      />
    </Container>
  )
)
