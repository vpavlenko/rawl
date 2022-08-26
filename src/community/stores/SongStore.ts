import { makeObservable, observable } from "mobx"
import Song, { emptySong } from "../../common/song"

export class SongStore {
  song: Song = emptySong()

  constructor() {
    makeObservable(this, {
      song: observable.ref,
    })
  }
}
