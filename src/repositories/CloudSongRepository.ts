import {
  QueryDocumentSnapshot,
  addDoc,
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
import {
  FirestoreSong,
  songCollection,
  songDataCollection,
} from "../firebase/song"
import { CloudSong, ICloudSongRepository } from "./ICloudSongRepository"

export class CloudSongRepository implements ICloudSongRepository {
  private songRef(id: string) {
    return doc(songCollection, id)
  }

  async create(
    data: Pick<CloudSong, "name" | "songDataId" | "userId">,
  ): Promise<string> {
    if (auth.currentUser === null) {
      throw new Error("You must be logged in to save songs to the cloud")
    }

    const dataRef = doc(songDataCollection, data.songDataId)

    const document = await addDoc(songCollection, {
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

  async getSongsByUserId(userId: string): Promise<CloudSong[]> {
    if (auth.currentUser === null) {
      throw new Error("You must be logged in to get songs from the cloud")
    }

    const res = await getDocs(
      query(songCollection, where("userId", "==", userId)),
    )

    return res.docs.map(toSong)
  }

  async getPublicSongs(): Promise<CloudSong[]> {
    // 'isPublic'がtrueで、'publishedAt'でソートされたクエリ
    const publicSongsQuery = query(
      songCollection,
      where("isPublic", "==", true),
      orderBy("publishedAt"),
    )

    const docs = await getDocs(publicSongsQuery)
    return docs.docs.map(toSong)
  }
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
