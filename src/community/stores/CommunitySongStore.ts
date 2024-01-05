import { makeObservable, observable } from "mobx"
import {
  CloudSong,
  ICloudSongRepository,
} from "../../repositories/ICloudSongRepository"

export class CommunitySongStore {
  isLoading = false
  songs: CloudSong[] = []

  constructor(private readonly cloudSongRepository: ICloudSongRepository) {
    makeObservable(this, {
      isLoading: observable,
      songs: observable,
    })
  }

  async load() {
    this.isLoading = true
    this.songs = await this.cloudSongRepository.getPublicSongs()
    this.isLoading = false
  }
}
