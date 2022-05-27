import { mat4, vec4 } from "gl-matrix"
import { VFC } from "react"
import { IRect } from "../../../common/geometry"
import {
  BorderedRectangleBuffer,
  BorderedRectangleShader,
} from "../../gl/shaders/BorderedRectangleShader"
import { GLNode } from "./GLNode"

export interface BordererdRectanglesProps {
  rects: IRect[]
  projectionMatrix: mat4
  fillColor: vec4
  strokeColor: vec4
}

export const BordererdRectangles: VFC<BordererdRectanglesProps> = ({
  rects,
  projectionMatrix,
  fillColor,
  strokeColor,
}) => {
  return (
    <GLNode
      createShader={BorderedRectangleShader}
      createBuffer={(gl) => new BorderedRectangleBuffer(gl)}
      uniforms={{ projectionMatrix, fillColor, strokeColor }}
      buffer={rects}
    />
  )
}
