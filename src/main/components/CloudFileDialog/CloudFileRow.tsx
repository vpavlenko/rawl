import styled from "@emotion/styled"
import { QueryDocumentSnapshot } from "firebase/firestore"
import { FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { FirestoreSong } from "../../../firebase/song"

const Container = styled.div`
  display: flex;
  cursor: pointer;
  height: 2.5rem;
  overflow: hidden;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const Cell = styled.div`
  display: flex;
  align-items: center;
  padding: 0 1rem;
  box-sizing: border-box;
`

const NameCell = styled(Cell)`
  overflow: hidden;
  flex-grow: 1;
`

const DateCell = styled(Cell)`
  width: 12rem;
  flex-shrink: 0;
`

const NoWrapText = styled.span`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export interface CloudFileRowProps {
  onClick: () => void
  song: QueryDocumentSnapshot<FirestoreSong>
  dateType: "created" | "updated"
}

export const CloudFileRow: FC<CloudFileRowProps> = ({
  song,
  onClick,
  dateType,
}) => {
  const date: Date = (() => {
    switch (dateType) {
      case "created":
        return song.data().createdAt.toDate()
      case "updated":
        return song.data().updatedAt.toDate()
    }
  })()
  const songName =
    song.data().name.length > 0
      ? song.data().name
      : localized("untitled-song", "Untitled song")
  const dateStr = date.toLocaleDateString() + " " + date.toLocaleTimeString()
  return (
    <Container onClick={onClick}>
      <NameCell>
        <NoWrapText>{songName}</NoWrapText>
      </NameCell>
      <DateCell>{dateStr}</DateCell>
    </Container>
  )
}
