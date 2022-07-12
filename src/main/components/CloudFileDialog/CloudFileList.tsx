import { useTheme } from "@emotion/react"
import styled from "@emotion/styled"
import { ArrowDownward, ArrowDropDown, ArrowUpward } from "@mui/icons-material"
import {
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { QueryDocumentSnapshot } from "firebase/firestore"
import { observer } from "mobx-react-lite"
import { useEffect, useRef, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { setSong } from "../../actions"
import { FirestoreSong, loadSong } from "../../firebase/song"
import { useStores } from "../../hooks/useStores"

const ArrowUp = styled(ArrowUpward)`
  width: "1.1rem";
  height: "1.1rem";
`

const ArrowDown = styled(ArrowDownward)`
  width: "1.1rem";
  height: "1.1rem";
`

const TH = styled(TableCell)`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  background: ${({ theme }) => theme.backgroundColor};
  color: ${({ theme }) => theme.secondaryTextColor};
  font-weight: ${({ isSelected }: { isSelected: boolean }) =>
    isSelected ? "bold" : "normal"};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const FileRow = styled(TableRow)`
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

export const CloudFileList = observer(() => {
  const rootStore = useStores()
  const { cloudFileStore } = rootStore
  const theme = useTheme()
  const { isLoading, dateType, files, selectedColumn, sortAscending } =
    cloudFileStore
  const [isDateMenuOpen, setDateMenuOpen] = useState(false)
  const dateCellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cloudFileStore.load()
  }, [])

  const onClickSong = async (song: QueryDocumentSnapshot<FirestoreSong>) => {
    try {
      const midiSong = await loadSong(song)
      setSong(rootStore)(midiSong)
      rootStore.rootViewStore.openCloudFileDialog = false
    } catch (e) {
      rootStore.toastStore.showError((e as Error).message)
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

  const sortOrderButton = (
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation()
        cloudFileStore.sortAscending = !cloudFileStore.sortAscending
      }}
      style={{
        color: theme.secondaryTextColor,
        marginLeft: "0.1em",
      }}
    >
      {sortAscending ? <ArrowDown /> : <ArrowUp />}
    </IconButton>
  )

  return (
    <>
      <TableContainer sx={{ maxHeight: 440, overflowX: "hidden" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TH
                sx={{
                  width: "60%",
                }}
                onClick={() => (cloudFileStore.selectedColumn = "name")}
                isSelected={selectedColumn === "name"}
              >
                {localized("name", "Name")}
                {selectedColumn === "name" && sortOrderButton}
              </TH>
              <TH
                ref={dateCellRef}
                onClick={() => (cloudFileStore.selectedColumn = "date")}
                isSelected={selectedColumn === "date"}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {sortLabel}
                  <IconButton
                    size="small"
                    style={{
                      marginLeft: "0.2em",
                    }}
                    onClick={() => setDateMenuOpen(true)}
                  >
                    <ArrowDropDown style={{ fill: theme.secondaryTextColor }} />
                  </IconButton>
                  {selectedColumn === "date" && sortOrderButton}
                </div>
              </TH>
            </TableRow>
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
                  <TableCell component="th" scope="row">
                    {songName}
                  </TableCell>
                  <TableCell>{dateStr}</TableCell>
                </FileRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Menu
        open={isDateMenuOpen}
        onClose={() => setDateMenuOpen(false)}
        anchorEl={dateCellRef.current}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          onClick={() => {
            setDateMenuOpen(false)
            cloudFileStore.dateType = "created"
          }}
        >
          {localized("created-date", "Created")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDateMenuOpen(false)
            cloudFileStore.dateType = "updated"
          }}
        >
          {localized("modified-date", "Modified")}
        </MenuItem>
      </Menu>
    </>
  )
})
