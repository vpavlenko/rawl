import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material"
import { QueryDocumentSnapshot } from "firebase/firestore"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { setSong } from "../../actions"
import { FirestoreSong, getSongs, loadSong } from "../../firebase/song"
import { useStores } from "../../hooks/useStores"

const FileList = observer(() => {
  const rootStore = useStores()
  const [isLoading, setLoading] = useState(true)
  const [files, setFiles] = useState<QueryDocumentSnapshot<FirestoreSong>[]>([])

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

  return (
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
