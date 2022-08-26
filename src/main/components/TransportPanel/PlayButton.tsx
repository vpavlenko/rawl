import styled from "@emotion/styled"
import { Pause, PlayArrow } from "@mui/icons-material"
import { FC } from "react"
import { CircleButton } from "./TransportPanel"

export const StyledButton = styled(CircleButton)`
  background: ${({ theme }) => theme.themeColor};

  &:hover {
    background: ${({ theme }) => theme.themeColor};
    opacity: 0.8;
  }

  &.active {
    background: ${({ theme }) => theme.themeColor};
  }
`

export interface PlayButtonProps {
  onClick?: () => void
  isPlaying: boolean
}

export const PlayButton: FC<PlayButtonProps> = ({ onClick, isPlaying }) => {
  return (
    <StyledButton
      id="button-play"
      onClick={onClick}
      className={isPlaying ? "active" : undefined}
    >
      {isPlaying ? <Pause /> : <PlayArrow />}
    </StyledButton>
  )
}
