export interface ICloudMidiRepository {
  get(id: string): Promise<Uint8Array>
  // returns document id
  storeMidiFile(url: string): Promise<string>
}
