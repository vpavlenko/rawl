import {
  CollectionReference,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDoc,
} from "firebase/firestore"
import { auth } from "../firebase/firebase"
import { User } from "./IUserRepository"

interface FirestoreUser {
  name: string
  photoURL: string
  bio: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export class UserRepository {
  private readonly userCollection: CollectionReference<FirestoreUser>

  constructor(private readonly firestore: Firestore) {
    this.userCollection = collection(this.firestore, "users").withConverter(
      userConverter,
    )
  }

  async getCurrentUser() {
    if (auth.currentUser === null) {
      throw new Error("You must be logged in to get the current user")
    }
    const userDoc = await getDoc(doc(this.userCollection, auth.currentUser.uid))
    if (!userDoc.exists()) {
      throw new Error("User not found")
    }
    return toUser(userDoc)
  }
}

const toUser = (snapshot: QueryDocumentSnapshot<FirestoreUser>): User => {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    name: data.name,
    photoURL: data.photoURL,
    bio: data.bio,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

const userConverter: FirestoreDataConverter<FirestoreUser> = {
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as FirestoreUser
    return data
  },
  toFirestore(user) {
    return user
  },
}
