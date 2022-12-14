import styled from "@emotion/styled"
import SkipNext from "mdi-react/SkipNextIcon"
import SkipPrevious from "mdi-react/SkipPreviousIcon"
import { FC } from "react"
import { Slider } from "../../components/Slider"
import { CircleButton } from "../../main/components/TransportPanel/CircleButton"
import { PlayButton } from "../../main/components/TransportPanel/PlayButton"
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

const PlaybackSlider = styled(Slider)`
  color: ${({ theme }) => theme.textColor};
  margin-left: 1rem;
`

export const BottomPlayer: FC = () => {
  const song = {
    song: {
      id: 2,
      name: "Swan, black",
    },
    user: {
      name: "blegassick1",
      created_at: new Date("2022-05-02T22:43:31Z"),
      photoURL:
        "https://robohash.org/autvoluptatemcumque.png?size=50x50&set=set1",
    },
  }

  return (
    <Wrapper>
      <Inner>
        <CircleButton>
          <SkipPrevious />
        </CircleButton>
        <PlayButton isPlaying={false} />
        <CircleButton>
          <SkipNext />
        </CircleButton>
        <PlaybackSlider
          value={0}
          onChange={() => {}}
          style={{ marginRight: "2rem" }}
        />
        <BottomPlayerSong song={song.song} user={song.user} />
      </Inner>
    </Wrapper>
  )
}
