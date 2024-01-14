import { makeObservable, observable } from "mobx"
import { CloudSong } from "../../repositories/ICloudSongRepository"

export class CommunitySongStore {
  songs: CloudSong[] = []

  constructor() {
    makeObservable(this, {
      songs: observable,
    })
  }
}
