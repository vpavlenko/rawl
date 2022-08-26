import styled from "@emotion/styled"
import { SkipNext, SkipPrevious } from "@mui/icons-material"
import { Slider } from "@mui/material"
import { FC } from "react"
import { CircleButton } from "../../main/components/TransportPanel/CircleButton"
import { PlayButton } from "../../main/components/TransportPanel/PlayButton"
import { BottomPlayerSong } from "./BottomPlayerSong"
import mock from "./MOCK_DATA.json"

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
  const songs = mock.map((d) => ({
    song: {
      id: d.id,
      name: d.song_name,
      updatedAt: new Date(d.created_at),
    },
    user: {
      name: d.name,
      photoURL: d.avatar,
    },
  }))

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
        <PlaybackSlider size="small" style={{ marginRight: "2rem" }} />
        <BottomPlayerSong song={songs[0].song} user={songs[0].user} />
      </Inner>
    </Wrapper>
  )
}
