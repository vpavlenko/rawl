import { songFromMidi } from "../../common/midi/midiConversion"
import { getFileHandle } from "../services/fs-helper"
import RootStore from "../stores/RootStore"

export const hasFSAccess =
  "chooseFileSystemEntries" in window || "showOpenFilePicker" in window

export const openFile = async (rootStore: RootStore) => {
  let fileHandle: FileSystemFileHandle
  try {
    fileHandle = await getFileHandle()
  } catch (ex) {
    if ((ex as Error).name === "AbortError") {
      return
    }
    const msg = "An error occured trying to open the file."
    console.error(msg, ex)
    alert(msg)
    return
  }
  const file = await fileHandle.getFile()
  const buf = await file.arrayBuffer()
  const song = songFromMidi(new Uint8Array(buf))
  song.filepath = file.name
  rootStore.song = song
}
