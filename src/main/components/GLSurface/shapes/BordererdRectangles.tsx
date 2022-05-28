import { vec4 } from "gl-matrix"
import { VFC } from "react"
import { IRect } from "../../../../common/geometry"
import {
  BorderedRectangleBuffer,
  BorderedRectangleShader,
} from "../../../gl/shaders/BorderedRectangleShader"
import { useProjectionMatrix } from "../../../hooks/useProjectionMatrix"
import { GLNode } from "../GLNode"

export interface BordererdRectanglesProps {
  rects: IRect[]
  fillColor: vec4
  strokeColor: vec4
  zIndex: number
}

export const BordererdRectangles: VFC<BordererdRectanglesProps> = ({
  rects,
  fillColor,
  strokeColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={BorderedRectangleShader}
      createBuffer={(gl) => new BorderedRectangleBuffer(gl)}
      uniforms={{ projectionMatrix, fillColor, strokeColor }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
