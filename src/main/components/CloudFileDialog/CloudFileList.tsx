import { PropsOf, useTheme } from "@emotion/react"
import styled from "@emotion/styled"
import { ArrowDownward, ArrowDropDown, ArrowUpward } from "@mui/icons-material"
import { QueryDocumentSnapshot } from "firebase/firestore"
import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import { useToast } from "use-toast-mui"
import { localized } from "../../../common/localize/localizedString"
import { CircularProgress } from "../../../components/CircularProgress"
import { IconButton } from "../../../components/IconButton"
import { Menu, MenuItem } from "../../../components/Menu"
import { FirestoreSong, loadSong } from "../../../firebase/song"
import { setSong } from "../../actions"
import { useStores } from "../../hooks/useStores"

const ArrowUp = styled(ArrowUpward)`
  width: 1.1rem;
  height: 1.1rem;
`

const ArrowDown = styled(ArrowDownward)`
  width: 1.1rem;
  height: 1.1rem;
`

const Table = styled.table`
  border-collapse: collapse;
  max-height: 20rem;
  overflow-x: hidden;
`

const Cell = styled.td`
  align-items: center;
  padding: 0 1rem;
  background: ${({ theme }) => theme.backgroundColor};
  font-weight: ${({ isSelected }: { isSelected?: boolean }) =>
    isSelected ? "bold" : "normal"};
  cursor: pointer;
  overflow-x: hidden;
  white-space: nowrap;
  max-width: 17rem;
  text-overflow: ellipsis;
  height: 2.5rem;
`

const HeadCell = styled(Cell)`
  padding: 0 1rem;
  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const TableHead = styled.thead`
  color: ${({ theme }) => theme.secondaryTextColor};
  width: 100%;
  display: block;
`

const TH: FC<PropsOf<typeof HeadCell>> = ({ children, ...props }) => {
  return (
    <HeadCell {...props}>
      <div style={{ display: "flex", alignItems: "center" }}>{children}</div>
    </HeadCell>
  )
}

const TableBody = styled.tbody`
  display: block;
  max-height: 20rem;
  width: 100%;
  overflow-y: auto;

  tr:hover td {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const SortButton: FC<{ sortAscending: boolean }> = ({ sortAscending }) =>
  sortAscending ? <ArrowDown /> : <ArrowUp />

const FileRow = styled.tr`
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

export const CloudFileList = observer(() => {
  const rootStore = useStores()
  const { cloudFileStore } = rootStore
  const toast = useToast()
  const theme = useTheme()
  const { isLoading, dateType, files, selectedColumn, sortAscending } =
    cloudFileStore

  useEffect(() => {
    cloudFileStore.load()
  }, [])

  const onClickSong = async (song: QueryDocumentSnapshot<FirestoreSong>) => {
    try {
      const midiSong = await loadSong(song)
      setSong(rootStore)(midiSong)
      rootStore.rootViewStore.openCloudFileDialog = false
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  if (isLoading) {
    return <CircularProgress />
  }

  const sortLabel = (() => {
    switch (dateType) {
      case "created":
        return localized("created-date", "Created")
      case "updated":
        return localized("modified-date", "Modified")
    }
  })()

  return (
    <Table>
      <TableHead>
        <tr>
          <TH
            style={{
              width: "70%",
            }}
            onClick={() => {
              if (cloudFileStore.selectedColumn === "name") {
                cloudFileStore.sortAscending = !cloudFileStore.sortAscending
              } else {
                cloudFileStore.selectedColumn = "name"
              }
            }}
            isSelected={selectedColumn === "name"}
          >
            {localized("name", "Name")}
            <div style={{ width: "0.5rem" }}></div>
            {selectedColumn === "name" && (
              <SortButton sortAscending={sortAscending} />
            )}
          </TH>
          <TH
            onClick={() => {
              if (cloudFileStore.selectedColumn === "date") {
                cloudFileStore.sortAscending = !cloudFileStore.sortAscending
              } else {
                cloudFileStore.selectedColumn = "date"
              }
            }}
            isSelected={selectedColumn === "date"}
          >
            {sortLabel}
            <Menu
              trigger={
                <IconButton
                  style={{
                    marginLeft: "0.2em",
                  }}
                >
                  <ArrowDropDown style={{ fill: theme.secondaryTextColor }} />
                </IconButton>
              }
            >
              <MenuItem onClick={() => (cloudFileStore.dateType = "created")}>
                {localized("created-date", "Created")}
              </MenuItem>
              <MenuItem onClick={() => (cloudFileStore.dateType = "updated")}>
                {localized("modified-date", "Modified")}
              </MenuItem>
            </Menu>
            {selectedColumn === "date" && (
              <SortButton sortAscending={sortAscending} />
            )}
          </TH>
        </tr>
      </TableHead>
      <TableBody>
        {files.map((song) => {
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
          const dateStr =
            date.toLocaleDateString() + " " + date.toLocaleTimeString()
          return (
            <FileRow key={song.id} onClick={() => onClickSong(song)}>
              <Cell>{songName}</Cell>
              <Cell>{dateStr}</Cell>
            </FileRow>
          )
        })}
      </TableBody>
    </Table>
  )
})
