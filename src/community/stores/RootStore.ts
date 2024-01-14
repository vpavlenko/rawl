import Player from "../../common/player"
import { auth, firestore } from "../../firebase/firebase"
import { SoundFontSynth } from "../../main/services/SoundFontSynth"
import { AuthStore } from "../../main/stores/AuthStore"
import { CloudSongDataRepository } from "../../repositories/CloudSongDataRepository"
import { CloudSongRepository } from "../../repositories/CloudSongRepository"
import { ICloudSongDataRepository } from "../../repositories/ICloudSongDataRepository"
import { ICloudSongRepository } from "../../repositories/ICloudSongRepository"
import { CommunitySongStore } from "./CommunitySongStore"
import RootViewStore from "./RootViewStore"
import { SongStore } from "./SongStore"

export default class RootStore {
  readonly cloudSongRepository: ICloudSongRepository = new CloudSongRepository(
    firestore,
    auth,
  )
  readonly cloudSongDataRepository: ICloudSongDataRepository =
    new CloudSongDataRepository(firestore)
  readonly songStore = new SongStore(this.cloudSongDataRepository)
  readonly authStore = new AuthStore()
  readonly communitySongStore = new CommunitySongStore(this.cloudSongRepository)
  readonly rootViewStore = new RootViewStore()
  readonly player: Player
  readonly synth: SoundFontSynth

  constructor() {
    const context = new (window.AudioContext || window.webkitAudioContext)()

    this.synth = new SoundFontSynth(context)

    const dummySynth = {
      activate() {},
      sendEvent() {},
    }

    const dummyTrackMute = {
      shouldPlayTrack: () => true,
    }

    this.player = new Player(
      this.synth,
      dummySynth,
      dummyTrackMute,
      this.songStore,
    )

    this.setupSynth()
  }

  private async setupSynth() {
    const soundFontURL =
      "https://cdn.jsdelivr.net/gh/ryohey/signal@4569a31/public/A320U.sf2"
    await this.synth.setup()
    const data = await (await fetch(soundFontURL)).arrayBuffer()
    await this.synth.loadSoundFont(data)
  }
}
