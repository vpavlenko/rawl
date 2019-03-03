import { IRect } from "common/geometry"

// Stage に描画される要素
export default interface Item {
  id: any
  bounds: IRect
  render: (CanvasRenderingContext2D) => void
}
