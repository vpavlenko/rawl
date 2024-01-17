import styled from "@emotion/styled"
import SkipNext from "mdi-react/SkipNextIcon"
import SkipPrevious from "mdi-react/SkipPreviousIcon"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { CircleButton } from "../../main/components/TransportPanel/CircleButton"
import { PlayButton } from "../../main/components/TransportPanel/PlayButton"
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

  return (
    <Wrapper>
      <Inner>
        <CircleButton onClick={() => playPreviousSong(rootStore)()}>
          <SkipPrevious />
        </CircleButton>
        <PlayButton isPlaying={player.isPlaying} />
        <CircleButton
          onClick={() => playNextSong(rootStore)()}
          style={{ marginRight: "1rem" }}
        >
          <SkipNext />
        </CircleButton>
        {currentSong && <BottomPlayerSong song={currentSong.metadata} />}
      </Inner>
    </Wrapper>
  )
})
