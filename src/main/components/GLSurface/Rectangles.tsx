import { vec4 } from "gl-matrix"
import { VFC } from "react"
import { IRect } from "../../../common/geometry"
import {
  SolidRectangleBuffer,
  SolidRectangleShader,
} from "../../gl/shaders/SolidRectangleShader"
import { useProjectionMatrix } from "../../hooks/useProjectionMatrix"
import { GLNode } from "./GLNode"

export interface RectanglesProps {
  rects: IRect[]
  color: vec4
  zIndex?: number
}

export const Rectangles: VFC<RectanglesProps> = ({ rects, color, zIndex }) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={SolidRectangleShader}
      createBuffer={(gl) => new SolidRectangleBuffer(gl)}
      uniforms={{ projectionMatrix, color }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
