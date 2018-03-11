import { IRect } from "model/Rect"

// Stage に描画される要素
export default interface Item {
  id: any
  bounds: IRect
  render: (CanvasRenderingContext2D) => void 
}
