import styled from "@emotion/styled"
import Circle from "mdi-react/CircleIcon"
import PlayArrow from "mdi-react/PlayArrowIcon"
import { FC } from "react"
import { formatTimeAgo } from "../helpers/formatTimeAgo"

const Avatar = styled.img`
  border: 1px ${({ theme }) => theme.dividerColor} solid;
  border-radius: 999px;
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
`

const Content = styled.div`
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

const Title = styled.div`
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

const Wrapper = styled.div`
  display: flex;
  padding: 0.5rem 0;
  cursor: pointer;
  border-radius: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};

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

export interface SongListItemProps {
  song: { name: string; updatedAt: Date }
  user: { name: string; photoURL: string }
}

export const SongListItem: FC<SongListItemProps> = ({ song, user }) => {
  return (
    <Wrapper>
      <PlayButton />
      <Content>
        <Avatar src={user.photoURL} />
        <div>
          <Title>{song.name}</Title>
          <Username>@{user.name}</Username>
        </div>
      </Content>
      <Time>{formatTimeAgo(song.updatedAt)}</Time>
    </Wrapper>
  )
}
