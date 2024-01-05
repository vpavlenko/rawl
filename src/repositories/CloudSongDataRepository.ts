import {
  Bytes,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { auth } from "../firebase/firebase"
import { songDataCollection } from "../firebase/song"
import {
  CloudSongData,
  ICloudSongDataRepository,
} from "./ICloudSongDataRepository"

export class CloudSongDataRepository implements ICloudSongDataRepository {
  private songDataRef(id: string) {
    return doc(songDataCollection, id)
  }

  async create(data: Pick<CloudSongData, "data" | "userId">): Promise<string> {
    if (auth.currentUser === null) {
      throw new Error("You must be logged in to save songs to the cloud")
    }

    const dataDoc = await addDoc(songDataCollection, {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      data: Bytes.fromUint8Array(data.data),
      userId: auth.currentUser.uid,
    })

    return dataDoc.id
  }

  async get(id: string): Promise<Uint8Array> {
    const ref = this.songDataRef(id)

    const snapshot = await getDoc(ref)
    const data = snapshot.data()?.data
    if (data === undefined) {
      throw new Error("Song data does not exist")
    }
    return data.toUint8Array()
  }

  async update(id: string, data: Pick<CloudSongData, "data">): Promise<void> {
    const ref = this.songDataRef(id)

    await updateDoc(ref, {
      updatedAt: serverTimestamp(),
      data: Bytes.fromUint8Array(data.data),
    })
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.songDataRef(id))
  }
}
