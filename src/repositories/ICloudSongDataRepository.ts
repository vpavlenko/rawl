export interface CloudSongData {
  id: string
  createdAt: Date
  updatedAt: Date
  data: Uint8Array
  userId: string
}

export interface ICloudSongDataRepository {
  create(data: Pick<CloudSongData, "data" | "userId">): Promise<string>
  get(id: string): Promise<Uint8Array>
  update(id: string, data: Pick<CloudSongData, "data">): Promise<void>
  delete(id: string): Promise<void>
}
