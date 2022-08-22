import styled from "@emotion/styled"
import { Circle, PlayArrow } from "@mui/icons-material"
import { FC } from "react"
import { HelmetProvider } from "react-helmet-async"
import { EmotionThemeProvider } from "../../main/components/Theme/EmotionThemeProvider"
import { GlobalCSS } from "../../main/components/Theme/GlobalCSS"
import { MuiThemeProvider } from "../../main/components/Theme/MuiThemeProvider"
import { formatTimeAgo } from "../helpers/formatTimeAgo"
import mock from "./MOCK_DATA.json"

const Avatar = styled.img`
  border: 1px ${({ theme }) => theme.dividerColor} solid;
  border-radius: 999px;
  width: 2rem;
  margin-right: 0.5rem;
`

const User = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

const Username = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.secondaryTextColor};
  font-size: 90%;
`

const SongTitle = styled.div`
  font-weight: 600;
  font-size: 130%;
`

const PlayButtonWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  margin-right: 0.5rem;

  .arrow {
    display: none;
  }
  .circle {
    display: block;
    width: 0.5rem;
    opacity: 0.2;
  }
`

const PlayButton = () => {
  return (
    <PlayButtonWrapper className="play-button">
      <Circle className="circle" />
      <PlayArrow className="arrow" />
    </PlayButtonWrapper>
  )
}

const SongWrapper = styled.div`
  display: flex;
  padding: 0.5rem 0;
  cursor: pointer;
  border-radius: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};

    .arrow {
      display: block;
    }
    .circle {
      display: none;
    }
  }
`

const Time = styled.div`
  margin-top: 0.2rem;
  margin-right: 1rem;
  color: ${({ theme }) => theme.secondaryTextColor};
`

const Song: FC<{
  song: { name: string; updatedAt: Date }
  user: { name: string; photoURL: string }
}> = ({ song, user }) => {
  const date = song.updatedAt
  return (
    <SongWrapper>
      <PlayButton />
      <User>
        <Avatar src={user.photoURL} />
        <div>
          <SongTitle>{song.name}</SongTitle>
          <Username>@{user.name}</Username>
        </div>
      </User>
      <Time>{formatTimeAgo(date)}</Time>
    </SongWrapper>
  )
}

const Container = styled.div`
  width: 80%;
  maxwidth: 60rem;
  margin: 0 auto;
`

const LogoWrapper = styled.a`
  display: flex;

  > img {
    height: 1.7rem;
  }

  &:hover {
    opacity: 0.7;
  }
`

const NavigationWrapper = styled.div`
  background: ${({ theme }) => theme.themeColor};
  padding: 1rem 0;
`

const Navigation: FC = () => {
  return (
    <NavigationWrapper>
      <Container>
        <LogoWrapper href="/">
          <img src="logo-white.svg" />
        </LogoWrapper>
      </Container>
    </NavigationWrapper>
  )
}

const SongList: FC = () => {
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
    <>
      <Navigation />
      <Container>
        <h1 style={{ marginTop: "4rem", marginBottom: "2rem" }}>
          Community Tracks
        </h1>
        {songs.map((s) => (
          <Song song={s.song} user={s.user} />
        ))}
      </Container>
    </>
  )
}

export const App: FC = () => {
  return (
    <MuiThemeProvider>
      <EmotionThemeProvider>
        <HelmetProvider>
          <GlobalCSS />
          <SongList />
        </HelmetProvider>
      </EmotionThemeProvider>
    </MuiThemeProvider>
  )
}
