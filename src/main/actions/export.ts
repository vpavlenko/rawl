import {
  audioDataToAudioBuffer,
  getSamplesFromSoundFont,
  OutMessage,
  StartMessage,
} from "@ryohey/wavelet"
import { encode } from "wav-encoder"
import { downloadBlob } from "../../common/helpers/Downloader"
import { songToSynthEvents } from "../../common/helpers/songToSynthEvents"
import { collectAllEvents } from "../../common/player"
import Song from "../../common/song"
import RootStore from "../stores/RootStore"

export const exportSongAsWav = (rootStore: RootStore) => () => {
  const {
    song,
    services: { synth },
    exportStore,
  } = rootStore

  const soundFontData = synth.loadedSoundFontData
  if (soundFontData === null) {
    return
  }

  const context = new (window.AudioContext || window.webkitAudioContext)()
  const url = new URL("@ryohey/wavelet/dist/rendererWorker.js", import.meta.url)
  const worker = new Worker(url)
  const samples = getSamplesFromSoundFont(
    new Uint8Array(soundFontData),
    context
  )
  const sampleRate = 44100
  const events = songToSynthEvents(song, sampleRate)
  const message: StartMessage = {
    samples,
    events,
    sampleRate,
  }
  worker.postMessage(message)

  exportStore.openExportProgressDialog = true
  exportStore.progress = 0

  worker.onmessage = async (e: MessageEvent<OutMessage>) => {
    switch (e.data.type) {
      case "progress": {
        exportStore.progress = e.data.numBytes / e.data.totalBytes
        break
      }
      case "complete": {
        exportStore.progress = 1

        const audioBuffer = audioDataToAudioBuffer(e.data.audioData)

        const wavData = await encode({
          sampleRate: audioBuffer.sampleRate,
          channelData: [
            audioBuffer.getChannelData(0),
            audioBuffer.getChannelData(1),
          ],
        })

        const blob = new Blob([wavData], { type: "audio/wav" })
        exportStore.openExportProgressDialog = false
        downloadBlob(blob, "song.wav")
        break
      }
    }
  }
}

export const cancelExport = (rootStore: RootStore) => () => {
  rootStore.exportStore.rendererWorker?.terminate()
}

export const canExport = (song: Song) =>
  collectAllEvents(song).some((e) => e.tick >= 120)
