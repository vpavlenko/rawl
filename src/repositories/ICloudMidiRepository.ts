export interface ICloudMidiRepository {
  get(id: string): Promise<Uint8Array>
}
