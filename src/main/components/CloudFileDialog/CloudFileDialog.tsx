import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Snackbar,
} from "@mui/material"
import { getDocs, QueryDocumentSnapshot } from "firebase/firestore"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { setSong } from "../../actions"
import {
  FirestoreSong,
  loadSong,
  songCollection,
} from "../../firebase/database"
import { useStores } from "../../hooks/useStores"

const FileList = observer(() => {
  const rootStore = useStores()
  const [isLoading, setLoading] = useState(true)
  const [files, setFiles] = useState<QueryDocumentSnapshot<FirestoreSong>[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isErrorVisible, setErrorVisible] = useState(false)

  useEffect(() => {
    ;(async () => {
      const snapshot = await getDocs(songCollection)
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
      setError(e as Error)
      setErrorVisible(true)
    }
  }

  return (
    <>
      <List
        sx={{
          overflow: "auto",
          maxHeight: 300,
        }}
        subheader={<li />}
      >
        {isLoading && <CircularProgress />}
        {files.map((song, i) => (
          <ListItemButton key={i} onClick={() => onClickSong(song)}>
            <ListItemText primary={song.data().name} />
          </ListItemButton>
        ))}
      </List>
      <Snackbar
        open={isErrorVisible}
        autoHideDuration={3000}
        onClose={() => setErrorVisible(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {error?.message}
        </Alert>
      </Snackbar>
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
