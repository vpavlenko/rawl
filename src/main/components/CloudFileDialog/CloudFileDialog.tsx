import styled from "@emotion/styled"
import { ArrowDownward, ArrowDropDown, ArrowUpward } from "@mui/icons-material"
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { QueryDocumentSnapshot } from "firebase/firestore"
import { orderBy } from "lodash"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { setSong } from "../../actions"
import { FirestoreSong, getSongs, loadSong } from "../../firebase/song"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"

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
  background: none;
  color: ${({ theme }) => theme.secondaryTextColor};
  font-weight: ${({ isSelected }: { isSelected: boolean }) =>
    isSelected ? "bold" : "normal"};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.secondaryBackgroundColor};
  }
`

const FileList = observer(() => {
  const rootStore = useStores()
  const theme = useTheme()
  const [isLoading, setLoading] = useState(true)
  const [isDateMenuOpen, setDateMenuOpen] = useState(false)
  const [dateType, setDateType] = useState<"created" | "updated">("created")
  const [selectedColumn, setSelectedColumn] = useState<"name" | "date">("date")
  const [sortAscending, setSortAscending] = useState(false)
  const [files, setFiles] = useState<QueryDocumentSnapshot<FirestoreSong>[]>([])
  const sortedFiles = useMemo(
    () =>
      orderBy(
        files,
        (f) => {
          const data = f.data()
          switch (selectedColumn) {
            case "name":
              return data.name
            case "date":
              switch (dateType) {
                case "created":
                  return data.createdAt.seconds
                case "updated":
                  return data.updatedAt.seconds
              }
          }
        },
        sortAscending ? "asc" : "desc"
      ),
    [files, dateType, selectedColumn, sortAscending]
  )
  const dateCellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      const snapshot = await getSongs()
      setFiles(snapshot.docs)
      setLoading(false)
    })()
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
        return "Created"
      case "updated":
        return "Modified"
    }
  })()

  const sortOrderButton = (
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation()
        setSortAscending((v) => !v)
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
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TH
              sx={{
                width: "60%",
              }}
              onClick={() => setSelectedColumn("name")}
              isSelected={selectedColumn === "name"}
            >
              Name
              {selectedColumn === "name" && sortOrderButton}
            </TH>
            <TH
              ref={dateCellRef}
              sx={{ display: "flex", alignItems: "center" }}
              onClick={() => setSelectedColumn("date")}
              isSelected={selectedColumn === "date"}
            >
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
            </TH>
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            overflow: "auto",
            maxHeight: 300,
          }}
        >
          {sortedFiles.map((song, i) => {
            const date: Date = (() => {
              switch (dateType) {
                case "created":
                  return song.data().createdAt.toDate()
                case "updated":
                  return song.data().updatedAt.toDate()
              }
            })()
            const dateStr =
              date.toLocaleDateString() + " " + date.toLocaleTimeString()
            return (
              <TableRow key={i} onClick={() => onClickSong(song)}>
                <TableCell component="th" scope="row">
                  {song.data().name}
                </TableCell>
                <TableCell>{dateStr}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
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
            setDateType("created")
          }}
        >
          Created
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDateMenuOpen(false)
            setDateType("updated")
          }}
        >
          Modified
        </MenuItem>
      </Menu>
    </>
  )
})

export const CloudFileDialog = observer(() => {
  const rootStore = useStores()
  const {
    rootViewStore,
    rootViewStore: { openCloudFileDialog },
  } = rootStore

  const onClose = useCallback(
    () => (rootViewStore.openCloudFileDialog = false),
    [rootViewStore]
  )

  return (
    <Dialog open={openCloudFileDialog} onClose={onClose} fullWidth>
      <DialogTitle>{localized("cloud-files", "Cloud files")}</DialogTitle>
      <DialogContent>
        <FileList />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{localized("close", "Close")}</Button>
      </DialogActions>
    </Dialog>
  )
})
