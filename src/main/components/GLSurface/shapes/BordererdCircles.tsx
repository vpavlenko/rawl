import { vec4 } from "gl-matrix"
import { VFC } from "react"
import { IRect } from "../../../../common/geometry"
import {
  BorderedCircleBuffer,
  BorderedCircleShader,
} from "../../../gl/shaders/BorderedCircleShader"
import { useProjectionMatrix } from "../../../hooks/useProjectionMatrix"
import { GLNode } from "../GLNode"

export interface BordererdCirclesProps {
  rects: IRect[]
  fillColor: vec4
  strokeColor: vec4
  zIndex: number
}

export const BordererdCircles: VFC<BordererdCirclesProps> = ({
  rects,
  fillColor,
  strokeColor,
  zIndex,
}) => {
  const projectionMatrix = useProjectionMatrix()

  return (
    <GLNode
      createShader={BorderedCircleShader}
      createBuffer={(gl) => new BorderedCircleBuffer(gl)}
      uniforms={{ projectionMatrix, fillColor, strokeColor }}
      buffer={rects}
      zIndex={zIndex}
    />
  )
}
