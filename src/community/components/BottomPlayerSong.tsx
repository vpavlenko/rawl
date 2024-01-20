import styled from "@emotion/styled"
import { FC } from "react"
import { Link } from "wouter"
import { Localized } from "../../components/Localized"
import { CloudSong } from "../../repositories/ICloudSongRepository"

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
  song: CloudSong
}

export const BottomPlayerSong: FC<SongListItemProps> = ({ song }) => {
  return (
    <Wrapper>
      <div>
        <Title>
          <Link
            href={`/songs/${song.id}`}
            style={{ color: "currentColor", textDecoration: "none" }}
          >
            {song.name.length > 0 ? (
              song.name
            ) : (
              <Localized default="Untitled song">untitled-song</Localized>
            )}
          </Link>
        </Title>
        {song.user && <Username>by {song.user.name}</Username>}
      </div>
    </Wrapper>
  )
}
