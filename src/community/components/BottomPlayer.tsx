import styled from "@emotion/styled"
import SkipNext from "mdi-react/SkipNextIcon"
import SkipPrevious from "mdi-react/SkipPreviousIcon"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { CircleButton } from "../../main/components/TransportPanel/CircleButton"
import { PlayButton } from "../../main/components/TransportPanel/PlayButton"
import { useToast } from "../../main/hooks/useToast"
import { playNextSong, playPreviousSong } from "../actions/song"
import { useStores } from "../hooks/useStores"
import { BottomPlayerSong } from "./BottomPlayerSong"

const Wrapper = styled.div`
  border-top: 1px solid ${({ theme }) => theme.dividerColor};
  padding: 1rem 0;
`

const Inner = styled.div`
  width: 80%;
  max-width: 60rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
`

export const BottomPlayer: FC = observer(() => {
  const rootStore = useStores()
  const {
    player,
    songStore: { currentSong },
  } = rootStore
  const toast = useToast()

  const onClickPlay = () => {
    player.isPlaying ? player.stop() : player.play()
  }

  const onClickPrevious = () => {
    try {
      playPreviousSong(rootStore)()
    } catch (e) {
      toast.error(`Failed to play: ${(e as Error).message}`)
    }
  }

  const onClickNext = () => {
    try {
      playNextSong(rootStore)()
    } catch (e) {
      toast.error(`Failed to play: ${(e as Error).message}`)
    }
  }

  return (
    <Wrapper>
      <Inner>
        <CircleButton onClick={onClickPrevious}>
          <SkipPrevious />
        </CircleButton>
        <PlayButton isPlaying={player.isPlaying} onMouseDown={onClickPlay} />
        <CircleButton onClick={onClickNext} style={{ marginRight: "1rem" }}>
          <SkipNext />
        </CircleButton>
        {currentSong && <BottomPlayerSong song={currentSong.metadata} />}
      </Inner>
    </Wrapper>
  )
})
