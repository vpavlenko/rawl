import styled from "@emotion/styled"
import { Circle, PlayArrow } from "@mui/icons-material"
import { FC } from "react"
import { formatTimeAgo } from "../helpers/formatTimeAgo"

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

export const SongListItem: FC<{
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
