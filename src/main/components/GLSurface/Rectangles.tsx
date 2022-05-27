import { mat4, vec4 } from "gl-matrix"
import { VFC } from "react"
import { IRect } from "../../../common/geometry"
import {
  SolidRectangleBuffer,
  SolidRectangleShader,
} from "../../gl/shaders/SolidRectangleShader"
import { GLNode } from "./GLSurface"

export interface RectanglesProps {
  rects: IRect[]
  projectionMatrix: mat4
  color: vec4
}

export const Rectangles: VFC<RectanglesProps> = ({
  rects,
  projectionMatrix,
  color,
}) => {
  return (
    <GLNode
      createShader={SolidRectangleShader}
      createBuffer={(gl) => new SolidRectangleBuffer(gl)}
      uniforms={{ projectionMatrix, color }}
      buffer={rects}
    />
  )
}
