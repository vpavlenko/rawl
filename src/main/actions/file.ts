import { songFromMidi, songToMidi } from "../../common/midi/midiConversion"
import { writeFile } from "../services/fs-helper"
import RootStore from "../stores/RootStore"
import { setSong } from "./song"

// URL parameter for automation purposes used in scripts/perf/index.js
// /edit?disableFileSystem=true
export const disableFileSystem =
  new URL(window.location.href).searchParams.get("disableFileSystem") === "true"

export const hasFSAccess =
  ("chooseFileSystemEntries" in window || "showOpenFilePicker" in window) &&
  !disableFileSystem

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
  const song = await songFromFile(file)
  song.fileHandle = fileHandle
  setSong(rootStore)(song)
}

export const songFromFile = async (file: File) => {
  const buf = await file.arrayBuffer()
  const song = songFromMidi(new Uint8Array(buf))
  if (song.name.length === 0) {
    // Use the file name without extension as the song title
    song.name = file.name.replace(/\.[^/.]+$/, "")
  }
  song.filepath = file.name
  song.isSaved = true
  return song
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

export const saveFileAs = async ({ song }: RootStore) => {
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
    const data = songToMidi(song).buffer
    await writeFile(fileHandle, data)
    song.fileHandle = fileHandle
  } catch (ex) {
    const msg = "Unable to save file."
    console.error(msg, ex)
    alert(msg)
    return
  }
}
