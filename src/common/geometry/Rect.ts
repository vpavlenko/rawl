import { IPoint } from "../geometry"

export interface IRect extends IPoint {
  width: number
  height: number
}

export function containsPoint(rect: IRect, point: IPoint) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

export function right(rect: IRect) {
  return rect.x + rect.width
}

export function bottom(rect: IRect) {
  return rect.y + rect.height
}

export function intersects(rectA: IRect, rectB: IRect) {
  return (
    right(rectA) > rectB.x &&
    right(rectB) > rectA.x &&
    bottom(rectA) > rectB.y &&
    bottom(rectB) > rectA.y
  )
}

export function containsRect(rectA: IRect, rectB: IRect) {
  return containsPoint(rectA, rectB) && containsPoint(rectA, br(rectB))
}

export function br(rect: IRect): IPoint {
  return {
    x: right(rect),
    y: bottom(rect),
  }
}

export function fromPoints(pointA: IPoint, pointB: IPoint): IRect {
  const x1 = Math.min(pointA.x, pointB.x)
  const x2 = Math.max(pointA.x, pointB.x)
  const y1 = Math.min(pointA.y, pointB.y)
  const y2 = Math.max(pointA.y, pointB.y)

  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
  }
}

export function scale(rect: IRect, scaleX: number, scaleY: number): IRect {
  return {
    x: rect.x * scaleX,
    y: rect.y * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  }
}

export const zeroRect: IRect = { x: 0, y: 0, width: 0, height: 0 }

export function moveRect(rect: IRect, p: IPoint): IRect {
  return {
    x: rect.x + p.x,
    y: rect.y + p.y,
    width: rect.width,
    height: rect.height,
  }
}
