import styled from "@emotion/styled"
import { FC } from "react"

const Avatar = styled.img`
  border: 1px ${({ theme }) => theme.dividerColor} solid;
  border-radius: 999px;
  width: 2rem;
  height: 2rem;
  margin-right: 0.5rem;
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  width: 15rem;
  flex-shrink: 0;
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

export interface SongListItemProps {
  song: { name: string }
  user: { name: string; photoURL: string }
}

export const BottomPlayerSong: FC<SongListItemProps> = ({ song, user }) => {
  return (
    <Wrapper>
      <Avatar src={user.photoURL} />
      <div>
        <Title>{song.name}</Title>
        <Username>@{user.name}</Username>
      </div>
    </Wrapper>
  )
}
