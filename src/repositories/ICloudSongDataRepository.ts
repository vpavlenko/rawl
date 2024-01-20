export interface CloudSongData {
  id: string
  createdAt: Date
  updatedAt: Date
  data: Uint8Array
  userId: string
  isPublic?: boolean
}

export interface ICloudSongDataRepository {
  create(data: Pick<CloudSongData, "data">): Promise<string>
  get(id: string): Promise<Uint8Array>
  update(id: string, data: Pick<CloudSongData, "data">): Promise<void>
  publish(id: string): Promise<void>
  unpublish(id: string): Promise<void>
  delete(id: string): Promise<void>
}
