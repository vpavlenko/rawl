export interface CloudSong {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  songDataId: string
  userId: string
}

export interface ICloudSongRepository {
  create(
    data: Pick<CloudSong, "name" | "songDataId" | "userId">,
  ): Promise<string>
  update(songId: string, data: Pick<CloudSong, "name">): Promise<void>
  delete(songId: string): Promise<void>
  getSongsByUserId(userId: string): Promise<CloudSong[]>
  getPublicSongs(): Promise<CloudSong[]>
}
