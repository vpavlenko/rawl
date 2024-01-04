import { getDocs, orderBy, query, where } from "firebase/firestore"
import { songCollection } from "./song"

// 'isPublic'がtrueで、'publishedAt'でソートされたクエリ
const publicSongsQuery = query(
  songCollection,
  where("isPublic", "==", true),
  orderBy("publishedAt"),
)

export const getPublicSongs = async () => {
  // クエリの実行とデータの取得
  return getDocs(publicSongsQuery)
}
