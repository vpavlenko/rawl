import {
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { auth } from "../firebase/firebase"
import { songDataCollection } from "./CloudSongDataRepository"
import { CloudSong, ICloudSongRepository } from "./ICloudSongRepository"

export class CloudSongRepository implements ICloudSongRepository {
  constructor(private readonly firestore: Firestore) {}

  private get songCollection() {
    return songCollection(this.firestore)
  }

  private songRef(id: string) {
    return doc(this.songCollection, id)
  }

  async create(data: Pick<CloudSong, "name" | "songDataId">): Promise<string> {
    if (auth.currentUser === null) {
      throw new Error("You must be logged in to save songs to the cloud")
    }

    const dataRef = doc(songDataCollection(this.firestore), data.songDataId)

    const document = await addDoc(this.songCollection, {
      name: data.name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      dataRef,
      userId: auth.currentUser.uid,
    })

    return document.id
  }

  async update(songId: string, data: Pick<CloudSong, "name">): Promise<void> {
    const ref = this.songRef(songId)

    await updateDoc(ref, {
      updatedAt: serverTimestamp(),
      name: data.name,
    })
  }

  async delete(songId: string): Promise<void> {
    await deleteDoc(this.songRef(songId))
  }

  async getMySongs(): Promise<CloudSong[]> {
    if (auth.currentUser === null) {
      throw new Error("You must be logged in to get songs from the cloud")
    }

    const res = await getDocs(
      query(this.songCollection, where("userId", "==", auth.currentUser.uid)),
    )

    return res.docs.map(toSong)
  }

  async getPublicSongs(): Promise<CloudSong[]> {
    // 'isPublic'がtrueで、'publishedAt'でソートされたクエリ
    const publicSongsQuery = query(
      this.songCollection,
      where("isPublic", "==", true),
      orderBy("publishedAt"),
    )

    const docs = await getDocs(publicSongsQuery)
    return docs.docs.map(toSong)
  }
}

interface FirestoreSong {
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
  dataRef: DocumentReference
  userId: string
}

const toSong = (doc: QueryDocumentSnapshot<FirestoreSong>): CloudSong => {
  const data = doc.data()
  return {
    ...data,
    id: doc.id,
    songDataId: data.dataRef.id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    publishedAt: data.publishedAt?.toDate(),
  }
}

const songConverter: FirestoreDataConverter<FirestoreSong> = {
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as FirestoreSong
    return data
  },
  toFirestore(song) {
    return song
  },
}

export const songCollection = (firestore: Firestore) =>
  collection(firestore, "songs").withConverter(songConverter)
