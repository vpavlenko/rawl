import { IRect } from "../../common/geometry"

export function rectToTriangles(rect: IRect): number[] {
  return [
    rect.x,
    rect.y,
    rect.x + rect.width,
    rect.y,
    rect.x,
    rect.y + rect.height,
    rect.x + rect.width,
    rect.y,
    rect.x + rect.width,
    rect.y + rect.height,
    rect.x,
    rect.y + rect.height,
  ]
}

export function rectToTriangleBounds(rect: IRect): number[] {
  const bounds = [rect.x, rect.y, rect.width, rect.height]
  return Array(6).fill(bounds).flat()
}
