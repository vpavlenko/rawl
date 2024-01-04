import { DocumentReference } from "firebase/firestore"
import { makeObservable, observable } from "mobx"
import Song, { emptySong } from "../../common/song"
import { loadSongFromFirestore } from "../../firebase/song"

export class SongStore {
  song: Song = emptySong()

  constructor() {
    makeObservable(this, {
      song: observable.ref,
    })
  }

  async loadSong(ref: DocumentReference) {
    const song = await loadSongFromFirestore(ref)
    this.song = song
  }
}
