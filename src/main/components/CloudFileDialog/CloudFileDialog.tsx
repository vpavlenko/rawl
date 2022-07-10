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
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { localized } from "../../../common/localize/localizedString"
import { setSong } from "../../actions"
import { FirestoreSong, getSongs, loadSong } from "../../firebase/song"
import { useStores } from "../../hooks/useStores"

const arrowIconStyle: CSSProperties = { width: "1.1rem", height: "1.1rem" }

const FileList = observer(() => {
  const rootStore = useStores()
  const [isLoading, setLoading] = useState(true)
  const [isDateMenuOpen, setDateMenuOpen] = useState(false)
  const [sortType, setSortType] = useState<"created" | "modified">("created")
  const [sortAscending, setSortAscending] = useState(false)
  const [files, setFiles] = useState<QueryDocumentSnapshot<FirestoreSong>[]>([])
  const sortedFiles = useMemo(
    () =>
      orderBy(
        files,
        (f) => {
          switch (sortType) {
            case "created":
              return f.data().updatedAt.seconds
            case "modified":
              return f.data().createdAt.seconds
          }
        },
        sortAscending ? "asc" : "desc"
      ),
    [files, sortType, sortAscending]
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
    switch (sortType) {
      case "created":
        return "Created"
      case "modified":
        return "Modified"
    }
  })()

  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "60%" }}>Title</TableCell>
            <TableCell
              ref={dateCellRef}
              sx={{ display: "flex", alignItems: "center" }}
              onClick={() => setDateMenuOpen(true)}
            >
              {sortLabel}
              <ArrowDropDown style={{ marginLeft: "0.1em" }} />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  setSortAscending((v) => !v)
                }}
              >
                {sortAscending ? (
                  <ArrowDownward style={arrowIconStyle} />
                ) : (
                  <ArrowUpward style={arrowIconStyle} />
                )}
              </IconButton>
            </TableCell>
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
              switch (sortType) {
                case "created":
                  return song.data().createdAt.toDate()
                case "modified":
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
            setSortType("created")
          }}
        >
          Created
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDateMenuOpen(false)
            setSortType("modified")
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
