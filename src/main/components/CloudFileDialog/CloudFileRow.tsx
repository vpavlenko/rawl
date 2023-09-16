import styled from "@emotion/styled"
import { QueryDocumentSnapshot } from "firebase/firestore"
import DotsHorizontalIcon from "mdi-react/DotsHorizontalIcon"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { IconButton } from "../../../components/IconButton"
import { Localized } from "../../../components/Localized"
import { Menu, MenuItem } from "../../../components/Menu"
import { FirestoreSong } from "../../../firebase/song"
import { useLocalization } from "../../hooks/useLocalization"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { useToast } from "../../hooks/useToast"

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

const MenuCell = styled(Cell)`
  width: 4rem;
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

export const CloudFileRow: FC<CloudFileRowProps> = observer(
  ({ song, onClick, dateType }) => {
    const theme = useTheme()
    const toast = useToast()
    const localized = useLocalization()
    const { cloudFileStore } = useStores()
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
        <MenuCell>
          <Menu
            trigger={
              <IconButton
                style={{
                  marginLeft: "0.2em",
                }}
              >
                <DotsHorizontalIcon
                  style={{ fill: theme.secondaryTextColor }}
                />
              </IconButton>
            }
          >
            <MenuItem
              onClick={async (e) => {
                e.stopPropagation()
                try {
                  await cloudFileStore.deleteSong(song)
                  toast.info(localized("song-deleted", "Song deleted"))
                } catch (e) {
                  console.error(e)
                  toast.error(
                    localized("song-delete-failed", "Song delete failed"),
                  )
                }
              }}
            >
              <Localized default="Delete">delete</Localized>
            </MenuItem>
          </Menu>
        </MenuCell>
      </Container>
    )
  },
)
