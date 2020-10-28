import { IRect } from "../../../common/geometry"

// Stage に描画される要素
export default interface Item {
  bounds: IRect
  render: (ctx: CanvasRenderingContext2D) => void
}
