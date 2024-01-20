import {
  Bytes,
  Firestore,
  FirestoreDataConverter,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { auth } from "../firebase/firebase"
import {
  CloudSongData,
  ICloudSongDataRepository,
} from "./ICloudSongDataRepository"

export class CloudSongDataRepository implements ICloudSongDataRepository {
  constructor(private readonly firestore: Firestore) {}

  private get songDataCollection() {
    return songDataCollection(this.firestore)
  }

  private songDataRef(id: string) {
    return doc(this.songDataCollection, id)
  }

  async create(data: Pick<CloudSongData, "data">): Promise<string> {
    if (auth.currentUser === null) {
      throw new Error("You must be logged in to save songs to the cloud")
    }

    const dataDoc = await addDoc(this.songDataCollection, {
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

  async publish(id: string): Promise<void> {
    const ref = this.songDataRef(id)

    await updateDoc(ref, {
      isPublic: true,
    })
  }

  async unpublish(id: string): Promise<void> {
    const ref = this.songDataRef(id)

    await updateDoc(ref, {
      isPublic: false,
    })
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.songDataRef(id))
  }
}

interface FirestoreSongData {
  createdAt: Timestamp
  updatedAt: Timestamp
  data?: Bytes
  userId: string
  isPublic?: boolean
}

const songDataConverter: FirestoreDataConverter<FirestoreSongData> = {
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)
    return data as FirestoreSongData
  },
  toFirestore(song) {
    return song
  },
}

export const songDataCollection = (firestore: Firestore) =>
  collection(firestore, "songData").withConverter(songDataConverter)
