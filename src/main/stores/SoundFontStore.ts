import { makeObservable, observable } from "mobx"
import { makePersistable } from "mobx-persist-store"
import { IndexedDBStorage, Metadata } from "../services/IndexedDBStorage"
import { SoundFontSynth } from "../services/SoundFontSynth"

const storeName = "soundfonts"

interface LocalSoundFont extends Metadata {
  type: "local"
  data: ArrayBuffer
}

interface RemoteSoundFont extends Metadata {
  type: "remote"
  url: string
}

type SoundFontItem = LocalSoundFont | RemoteSoundFont

const defaultSoundFonts: SoundFontItem[] = [
  {
    id: -999, // Use negative number to avoid conflict with user saved soundfonts
    type: "remote",
    name: "A320U",
    url: "https://cdn.jsdelivr.net/gh/ryohey/signal@4569a31/public/A320U.sf2",
  },
]

export class SoundFontStore {
  private readonly storage: IndexedDBStorage<SoundFontItem>
  files: Metadata[] = []
  lastSelectedSoundFontId: number | null = null

  constructor(private readonly synth: SoundFontSynth) {
    makeObservable(this, {
      files: observable,
      lastSelectedSoundFontId: observable,
    })

    makePersistable(this, {
      name: "SoundFontStore",
      properties: ["lastSelectedSoundFontId"],
      storage: window.localStorage,
    })

    this.storage = new IndexedDBStorage("soundfonts", 1)
    this.init()
  }

  private async init() {
    await this.storage.init()
    const savedFiles = await this.storage.list()
    this.files = [...defaultSoundFonts, ...savedFiles]
  }

  private async getSoundFont(id: number): Promise<SoundFontItem | null> {
    const defaultSoundFont = defaultSoundFonts.find((f) => f.id === id)
    if (defaultSoundFont !== undefined) {
      return defaultSoundFont
    }
    return await this.storage.load(id)
  }

  async loadLastSelectedSoundFont() {
    await this.load(this.lastSelectedSoundFontId ?? defaultSoundFonts[0].id)
  }

  async load(id: number) {
    const soundfont = await this.getSoundFont(id)

    if (soundfont === null) {
      throw new Error("SoundFont not found")
    }

    switch (soundfont.type) {
      case "local":
        await this.synth.loadSoundFont(soundfont.data)
        break
      case "remote":
        await this.synth.loadSoundFontFromURL(soundfont.url)
        break
    }
  }
}
