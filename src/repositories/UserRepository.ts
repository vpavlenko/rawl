import { Auth } from "firebase/auth"
import {
  CollectionReference,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { IUserRepository, User } from "./IUserRepository"

interface FirestoreUser {
  name: string
  photoURL: string
  bio: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export class UserRepository implements IUserRepository {
  private readonly userCollection: CollectionReference<FirestoreUser>

  constructor(
    private readonly firestore: Firestore,
    private readonly auth: Auth,
  ) {
    this.userCollection = collection(this.firestore, "users").withConverter(
      userConverter,
    )
  }

  private get userRef() {
    if (this.auth.currentUser === null) {
      throw new Error("You must be logged in to get the current user")
    }
    return doc(this.userCollection, this.auth.currentUser.uid)
  }

  async create(data: Pick<User, "name" | "photoURL" | "bio">): Promise<void> {
    await setDoc(this.userRef, {
      name: data.name,
      photoURL: data.photoURL,
      bio: data.bio,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  async update(data: Pick<User, "name" | "photoURL" | "bio">): Promise<void> {
    await updateDoc(this.userRef, {
      name: data.name,
      photoURL: data.photoURL,
      bio: data.bio,
      updatedAt: Timestamp.now(),
    })
  }

  async getCurrentUser() {
    const userDoc = await getDoc(this.userRef)
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
