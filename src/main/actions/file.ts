import { songFromMidi, songToMidi } from "../../common/midi/midiConversion"
import { writeFile } from "../services/fs-helper"
import RootStore from "../stores/RootStore"

export const hasFSAccess =
  "chooseFileSystemEntries" in window || "showOpenFilePicker" in window

export const openFile = async (rootStore: RootStore) => {
  let fileHandle: FileSystemFileHandle
  try {
    fileHandle = (
      await window.showOpenFilePicker({
        types: [
          {
            description: "MIDI file",
            accept: { "audio/midi": [".mid"] },
          },
        ],
      })
    )[0]
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
  song.fileHandle = fileHandle
  rootStore.song = song
}

export const saveFile = async (rootStore: RootStore) => {
  const fileHandle = rootStore.song.fileHandle
  if (fileHandle === null) {
    await saveFileAs(rootStore)
    return
  }

  const data = songToMidi(rootStore.song).buffer
  try {
    await writeFile(fileHandle, data)
  } catch (e) {
    console.error(e)
    alert("unable to save file")
  }
}

export const saveFileAs = async (rootStore: RootStore) => {
  let fileHandle
  try {
    fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: "MIDI file",
          accept: { "audio/midi": [".mid"] },
        },
      ],
    })
  } catch (ex) {
    if ((ex as Error).name === "AbortError") {
      return
    }
    const msg = "An error occured trying to open the file."
    console.error(msg, ex)
    alert(msg)
    return
  }
  try {
    const data = songToMidi(rootStore.song).buffer
    await writeFile(fileHandle, data)
    rootStore.song.fileHandle = fileHandle
  } catch (ex) {
    const msg = "Unable to save file."
    console.error(msg, ex)
    alert(msg)
    return
  }
}
