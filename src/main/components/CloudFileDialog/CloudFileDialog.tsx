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
import { getDoc, getDocs } from "firebase/firestore"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { songFromMidi } from "../../../common/midi/midiConversion"
import { setSong } from "../../actions"
import {
  FirestoreSong,
  songCollection,
  songDataConverter,
} from "../../firebase/database"
import { useStores } from "../../hooks/useStores"

const FileList = observer(() => {
  const rootStore = useStores()
  const [isLoading, setLoading] = useState(true)
  const [files, setFiles] = useState<FirestoreSong[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isErrorVisible, setErrorVisible] = useState(false)

  useEffect(() => {
    ;(async () => {
      const snapshot = await getDocs(songCollection)
      setFiles(snapshot.docs.map((d) => d.data()))
      setLoading(false)
    })()
  }, [])

  const openSong = async (song: FirestoreSong) => {
    const snapshot = await getDoc(song.data.withConverter(songDataConverter))
    const data = snapshot.data()?.data
    if (data === undefined) {
      throw new Error("Song data does not exist")
    }
    const buf = await data.arrayBuffer()

    const midiSong = songFromMidi(new Uint8Array(buf))
    setSong(rootStore)(midiSong)
  }

  const onClickSong = async (song: FirestoreSong) => {
    try {
      await openSong(song)
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
            <ListItemText primary={song.name} />
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
