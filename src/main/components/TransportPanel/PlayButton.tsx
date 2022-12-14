import styled from "@emotion/styled"
import Pause from "mdi-react/PauseIcon"
import PlayArrow from "mdi-react/PlayArrowIcon"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { Tooltip } from "../../../components/Tooltip"
import { CircleButton } from "./CircleButton"

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

export const PlayButton: FC<PlayButtonProps> = (
  { onClick, isPlaying },
  ref
) => {
  return (
    <Tooltip
      title={`${localized("play-pause", "Play/Pause")} [space]`}
      side="top"
    >
      <StyledButton
        id="button-play"
        onClick={onClick}
        className={isPlaying ? "active" : undefined}
      >
        {isPlaying ? <Pause /> : <PlayArrow />}
      </StyledButton>
    </Tooltip>
  )
}
