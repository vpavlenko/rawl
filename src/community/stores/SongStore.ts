import { computed, makeObservable, observable } from "mobx"
import { songFromMidi } from "../../common/midi/midiConversion"
import Song, { emptySong } from "../../common/song"
import { ICloudSongDataRepository } from "../../repositories/ICloudSongDataRepository"
import { CloudSong } from "../../repositories/ICloudSongRepository"

export interface SongItem {
  song: Song
  metadata: CloudSong
}

export class SongStore {
  currentSong: SongItem | null = null
  isLoading: boolean = false

  constructor(private readonly songDataRepository: ICloudSongDataRepository) {
    makeObservable(this, {
      song: computed,
      currentSong: observable,
      isLoading: observable,
    })
  }

  get song(): Song {
    return this.currentSong?.song ?? emptySong()
  }

  async loadSong(cloudSong: CloudSong) {
    this.isLoading = true
    const songData = await this.songDataRepository.get(cloudSong.songDataId)
    const song = songFromMidi(songData)
    this.currentSong = {
      song,
      metadata: cloudSong,
    }
    this.isLoading = false
  }
}
