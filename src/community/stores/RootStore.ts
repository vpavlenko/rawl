import Player from "../../common/player"
import { auth, firestore } from "../../firebase/firebase"
import { SoundFontSynth } from "../../main/services/SoundFontSynth"
import { AuthStore } from "../../main/stores/AuthStore"
import { CloudSongDataRepository } from "../../repositories/CloudSongDataRepository"
import { CloudSongRepository } from "../../repositories/CloudSongRepository"
import { ICloudSongDataRepository } from "../../repositories/ICloudSongDataRepository"
import { ICloudSongRepository } from "../../repositories/ICloudSongRepository"
import { IUserRepository } from "../../repositories/IUserRepository"
import { UserRepository } from "../../repositories/UserRepository"
import { LazySoundFontSynth } from "../services/LazySoundFontSynth"
import { CommunitySongStore } from "./CommunitySongStore"
import RootViewStore from "./RootViewStore"
import { SongStore } from "./SongStore"

export default class RootStore {
  readonly userRepository: IUserRepository = new UserRepository(firestore, auth)
  readonly cloudSongRepository: ICloudSongRepository = new CloudSongRepository(
    firestore,
    auth,
  )
  readonly cloudSongDataRepository: ICloudSongDataRepository =
    new CloudSongDataRepository(firestore)
  readonly songStore = new SongStore(this.cloudSongDataRepository)
  readonly authStore = new AuthStore(this.userRepository)
  readonly communitySongStore = new CommunitySongStore()
  readonly rootViewStore = new RootViewStore()
  readonly player: Player
  readonly synth: LazySoundFontSynth

  constructor() {
    const context = new (window.AudioContext || window.webkitAudioContext)()

    this.synth = new LazySoundFontSynth(new SoundFontSynth(context))

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
  }
}
